import User from '../models/user.model.js';
import Car from '../models/car.model.js';
import Purchase from '../models/purchase.model.js';
import Request from '../models/request.model.js';
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

export const getDetails = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.',
      });
    }

    // Get all agents
    const agents = await User.find({ role: 'agent' }).lean();

    // Get all users
    const users = await User.find({ role: 'normalUser' }).lean();

    // Process agents
    const processedAgents = await Promise.all(
      agents.map(async (agent) => {
        const cars = await Car.find({ agent: agent._id }).lean();
        const approvedCars = cars.filter((car) => car.status === 'available').length;
        const rejectedCars = cars.filter((car) => car.status === 'rejected').length;
        const pendingCars = cars.filter((car) => car.status === 'pending').length;
        const soldCars = cars.filter((car) => car.status === 'sold');
        const revenue = soldCars.reduce((acc, car) => acc + car.price, 0);
        const totalCars = approvedCars + rejectedCars + pendingCars + soldCars.length;
        const approvePercentage = totalCars > 0 ? (approvedCars / totalCars) * 100 : 0;

        return {
          _id: agent._id,
          email: agent.email,
          name: agent.username,
          approvedCars,
          rejectedCars,
          pendingCars,
          revenue,
          approvePercentage: approvePercentage.toFixed(2),
        };
      })
    );

    // Process users with real metrics (sell requests, bought cars, requests, revenues)
    const processedUsers = await Promise.all(
      users.map(async (u) => {
        // Sell requests: cars created by this user as seller
        const sellRequestsList = await Car.find({ seller: u._id }).lean();
        const sellRequests = sellRequestsList.length;

        // Sold revenue: sum of prices of cars sold by this user
        const soldCars = sellRequestsList.filter((c) => c.status === 'sold');
        const soldRevenue = soldCars.reduce((acc, car) => acc + (car.price || 0), 0);

        // Bought cars and revenue from purchases
        const purchases = await Purchase.find({ buyer: u._id }).lean();
        const boughtCars = purchases.length;
        const boughtRevenue = purchases.reduce((acc, p) => acc + (p.totalPrice || 0), 0);

        // Requested cars: count of requests by this user
        const requestedCars = await Request.countDocuments({ buyer: u._id });

        return {
          _id: u._id,
          email: u.email,
          contactNumber: u.mobileNumber ?? null,
          name: u.username,
          sellRequests,
          boughtCars,
          requestedCars,
          soldRevenue,
          boughtRevenue,
        };
      })
    );

    res.status(200).json({
      success: true,
      agents: processedAgents,
      users: processedUsers,
    });
  } catch (error) {
    next(error);
  }
};