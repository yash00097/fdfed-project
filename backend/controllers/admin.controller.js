import User from '../models/user.model.js';
import Car from '../models/car.model.js';
import mongoose from 'mongoose';

export const getAnalytics = async (req, res, next) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    // Get last 6 months of user registrations (single count, not split by provider)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const userRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          role: 'normalUser'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { 
          '_id.year': 1, 
          '_id.month': 1 
        }
      }
    ]);

    // Build an ordered, unique list of last 6 months and map counts
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const registrationsByMonth = [];
    let prevMonthTotal = 0;

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const monthEntry = userRegistrations.find(
        r => r._id.year === year && r._id.month === month
      );

      const totalCount = monthEntry?.count || 0;
      const percentChange = prevMonthTotal === 0
        ? 0
        : Number(((totalCount - prevMonthTotal) / Math.max(prevMonthTotal, 1) * 100).toFixed(1));

      registrationsByMonth.push({
        label: `${months[month - 1]} ${year}`,
        count: totalCount,
        percentChange
      });

      prevMonthTotal = totalCount;
    }

    // Get agent performance metrics with detailed stats
    const agentPerformance = await User.aggregate([
      {
        $match: { role: 'agent' }
      },
      {
        $lookup: {
          from: 'cars',
          let: { agentId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$agent', '$$agentId'] },
                updatedAt: { $gte: sixMonthsAgo }
              }
            },
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
                revenue: {
                  $sum: {
                    $cond: [
                      { $eq: ['$status', 'sold'] },
                      '$price',
                      0
                    ]
                  }
                }
              }
            }
          ],
          as: 'carStats'
        }
      },
      {
        $project: {
          _id: 1,
          name: '$username',
          avatar: '$avatar',
          email: '$email',
          revenue: {
            $reduce: {
              input: '$carStats',
              initialValue: 0,
              in: { $add: ['$$value', '$$this.revenue'] }
            }
          },
          availableCars: {
            $reduce: {
              input: {
                $filter: {
                  input: '$carStats',
                  as: 'stat',
                  cond: { $eq: ['$$stat._id', 'available'] }
                }
              },
              initialValue: 0,
              in: { $add: ['$$value', '$$this.count'] }
            }
          },
          soldCars: {
            $reduce: {
              input: {
                $filter: {
                  input: '$carStats',
                  as: 'stat',
                  cond: { $eq: ['$$stat._id', 'sold'] }
                  
                }
              },
              initialValue: 0,
              in: { $add: ['$$value', '$$this.count'] }
            }
          },
          rejectedCars: {
            $reduce: {
              input: {
                $filter: {
                  input: '$carStats',
                  as: 'stat',
                  cond: { $eq: ['$$stat._id', 'rejected'] }
                }
              },
              initialValue: 0,
              in: { $add: ['$$value', '$$this.count'] }
            }
          }
        }
      },
      {
        $sort: { revenue: -1 }
      }
    ]);

    // Format agent data and calculate performance metrics
    const agents = agentPerformance.map(agent => ({
      ...agent,
      totalCars: agent.availableCars + agent.soldCars + agent.rejectedCars,
      successRate: (agent.soldCars / (agent.availableCars + agent.soldCars + agent.rejectedCars) * 100).toFixed(1)
    }));

    // processed analytics data prepared for response

    res.status(200).json({
      success: true,
      registrations: registrationsByMonth,
      agents,
      metrics: {
        totalAgents: agents.length,
        totalRevenue: agents.reduce((sum, agent) => sum + agent.revenue, 0),
        totalSold: agents.reduce((sum, agent) => sum + agent.soldCars, 0),
        averageSuccessRate: ((
  agents.reduce((sum, agent) => sum + (parseFloat(agent.successRate) || 0), 0) /
  Math.max(agents.length, 1)
) || 0).toFixed(1)
      }
    });

  } catch (error) {
    next(error);
  }
};