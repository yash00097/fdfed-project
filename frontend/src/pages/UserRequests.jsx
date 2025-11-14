import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function UserRequests(){
  const { currentUser } = useSelector(state => state.user);
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(()=>{
    if(!currentUser){
      navigate('/sign-in');
      return;
    }
    if(currentUser.role !== 'admin'){
      // simple client-side guard
      setLoading(false);
      return;
    }

    const fetchRequests = async ()=>{
      setLoading(true);
      try{
        const res = await fetch('/backend/request-car/all', { credentials: 'include' });
        const data = await res.json();
        if(data.success){
          setRequests(data.requests || []);
        } else {
          console.error('Failed to load requests', data);
        }
      }catch(err){
        console.error(err);
      }finally{
        setLoading(false);
      }
    }
    fetchRequests();
  }, [currentUser, navigate]);

  const handleDelete = async (id)=>{
    if(!confirm('Delete this request? This cannot be undone.')) return;
    setDeletingId(id);
    try{
      const res = await fetch(`/backend/request-car/${id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if(data.success){
        setRequests(prev => prev.filter(r => r._id !== id));
      } else {
        alert(data.message || 'Could not delete');
      }
    }catch(err){
      console.error(err);
      alert('Network error');
    }finally{
      setDeletingId(null);
    }
  }

  if(!currentUser) return null;

  if(currentUser.role !== 'admin'){
    return (
      <div className="container mx-auto py-12">
        <div className="bg-white/5 p-6 rounded-lg border border-white/10"> 
          <h2 className="text-xl font-semibold text-white mb-2">Forbidden</h2>
          <p className="text-gray-300">You do not have access to this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-28 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white">All User Requests</h1>
            <p className="text-sm text-gray-400 mt-1">Manage requests submitted by users. Admins can remove requests from here.</p>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-md p-6 rounded-2xl border border-white/6">
            {loading ? (
              <div className="text-gray-300">Loading requests...</div>
            ) : (
              <div className="space-y-4">
                {requests.length === 0 && (
                  <div className="bg-slate-800/40 p-6 rounded-lg border border-white/6 text-gray-300 flex items-center justify-center">No requests found.</div>
                )}

                {requests.map((r) => (
                  <div
                    key={r._id}
                    className="group bg-slate-900/40 hover:bg-slate-900/50 transition-all duration-200 p-4 rounded-xl border border-white/6 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <img src={r.buyer?.avatar || '/src/assets/images/logo1.png'} alt="avatar" className="w-14 h-14 rounded-full object-cover ring-2 ring-white/6" />
                      <div>
                        <div className="text-white font-semibold text-lg">{r.buyer?.username || 'Unknown user'}</div>
                        <div className="text-gray-300 text-sm mt-1">{r.brand || 'Any brand'} {r.model ? `- ${r.model}` : ''}</div>
                        <div className="text-gray-400 text-xs mt-2">{r.vehicleType} • {r.transmission} • {r.fuelType}</div>
                        {r.preferredLocation?.city || r.preferredLocation?.state ? (
                          <div className="text-gray-400 text-xs mt-1">Location: {r.preferredLocation?.city || ''}{r.preferredLocation?.city && r.preferredLocation?.state ? ', ' : ''}{r.preferredLocation?.state || ''}</div>
                        ) : null}
                        {r.priceRange?.minPrice || r.priceRange?.maxPrice ? (
                          <div className="text-gray-400 text-xs mt-1">Price: {r.priceRange?.minPrice ?? 'Any'} - {r.priceRange?.maxPrice ?? 'Any'}</div>
                        ) : null}
                        {r.additionalRequirements && (
                          <div className="text-gray-400 text-xs mt-2">{r.additionalRequirements}</div>
                        )}
                        <div className="text-gray-500 text-xs mt-2">Requested: {new Date(r.createdAt).toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${r.status === 'active' ? 'bg-emerald-600/20 text-emerald-200' : r.status === 'fulfilled' ? 'bg-blue-600/20 text-blue-200' : 'bg-rose-600/20 text-rose-200'}`}>
                        {r.status}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={()=>handleDelete(r._id)}
                          disabled={deletingId === r._id}
                          className="px-4 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm shadow-sm disabled:opacity-60"
                        >
                          {deletingId === r._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
