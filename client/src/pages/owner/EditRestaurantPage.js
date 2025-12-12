import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchRestaurantForOwner, updateRestaurant } from '../../services/api';
import OwnerSidebar from '../../components/layout/OwnerSidebar';
import Modal from '../../components/common/Modal';
import './EditRestaurantPage.css';

const EditRestaurantPage = () => {
  const [formData, setFormData] = useState(null);
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const getRestaurant = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await fetchRestaurantForOwner(id);

        // Safely parse only if not already an array
        data.cuisine_types = Array.isArray(data.cuisine_types)
          ? data.cuisine_types
          : data.cuisine_types ? JSON.parse(data.cuisine_types) : [];

        data.special_areas = Array.isArray(data.special_areas)
          ? data.special_areas
          : data.special_areas ? JSON.parse(data.special_areas) : [];

        data.facilities = Array.isArray(data.facilities)
          ? data.facilities
          : data.facilities ? JSON.parse(data.facilities) : [];

  setFormData(data);
  // keep a deep copy of the original data so we can reset to it
  setInitialData(JSON.parse(JSON.stringify(data)));
      } catch (err) {
        console.error('Failed to fetch restaurant', err);
        setError('Could not load restaurant data. You may not be the owner or the restaurant does not exist.');
      } finally {
        setLoading(false);
      }
    };
    getRestaurant();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to save these changes?')) {
      try {
        const formDataToSend = new FormData();
        
        // Append all text fields
        Object.keys(formData).forEach(key => {
          if (key === 'cuisine_types' || key === 'special_areas' || key === 'facilities') {
            formDataToSend.append(key, JSON.stringify(formData[key] || []));
          } else if (key !== 'logo_image' && key !== 'gallery_images' && formData[key] !== undefined) {
            formDataToSend.append(key, formData[key]);
          }
        });

        // Append logo file if it exists in the input
        const logoInput = document.querySelector('input[name="logo_image"]');
        if (logoInput && logoInput.files[0]) {
          formDataToSend.append('logo_image', logoInput.files[0]);
        }

        // Append gallery files if any selected
        const galleryInput = document.querySelector('input[name="gallery_images"]');
        if (galleryInput && galleryInput.files && galleryInput.files.length > 0) {
          Array.from(galleryInput.files).forEach((file) => {
            formDataToSend.append('gallery_images', file);
          });
        }

        const response = await updateRestaurant(id, formDataToSend);

        // If server returned the updated restaurant, refresh local state so the UI shows saved values
        if (response && response.data && response.data.restaurant) {
          const saved = response.data.restaurant;
          // Parse list fields if stored as JSON strings
          try {
            saved.cuisine_types = typeof saved.cuisine_types === 'string' ? JSON.parse(saved.cuisine_types) : (Array.isArray(saved.cuisine_types) ? saved.cuisine_types : []);
          } catch (err) { saved.cuisine_types = []; }
          try {
            saved.special_areas = typeof saved.special_areas === 'string' ? JSON.parse(saved.special_areas) : (Array.isArray(saved.special_areas) ? saved.special_areas : []);
          } catch (err) { saved.special_areas = []; }
          try {
            saved.facilities = typeof saved.facilities === 'string' ? JSON.parse(saved.facilities) : (Array.isArray(saved.facilities) ? saved.facilities : []);
          } catch (err) { saved.facilities = []; }

          setFormData(saved);
          setInitialData(JSON.parse(JSON.stringify(saved)));
        }

        setIsModalOpen(true);
      } catch (error) {
        // Prefer server-provided message when available
        console.error('Update error:', error.response ? error.response.data : error);
        const serverMessage = error.response && (error.response.data && (error.response.data.message || error.response.data.error)) ? (error.response.data.message || error.response.data.error) : null;
        alert(serverMessage ? `Failed to update restaurant: ${serverMessage}` : 'Failed to update restaurant. See console for details.');
      }
    }
  };

  const handleReset = (e) => {
    // Reset form fields to the original fetched values
    if (!initialData) return;
    if (window.confirm('Reset all changes to the last saved values?')) {
      setFormData(JSON.parse(JSON.stringify(initialData)));

      // clear file inputs so they don't keep previous selection
      const logoInput = document.querySelector('input[name="logo_image"]');
      if (logoInput) logoInput.value = '';
      const galleryInput = document.querySelector('input[name="gallery_images"]');
      if (galleryInput) galleryInput.value = '';
    }
  };

  if (loading) {
    return (
      <div className="owner-layout">
        <OwnerSidebar />
        <main className="owner-content"><h1>Loading...</h1></main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="owner-layout">
        <OwnerSidebar />
        <main className="owner-content"><h1>Error</h1><p>{error}</p></main>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="owner-layout">
        <OwnerSidebar />
        <main className="owner-content"><h1>Restaurant not found.</h1></main>
      </div>
    );
  }

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          navigate('/owner/dashboard');
        }}
        title="Success!"
      >
        <p>Your restaurant details have been saved.</p>
      </Modal>

      <div className="owner-layout">
        <OwnerSidebar />
        <main className="owner-content">
          <h1>Edit: {formData.name}</h1>
          <form onSubmit={handleSubmit} className="edit-restaurant-form">
            {/* Basic Info */}
            <div className="section-box">
              <h3>Basic Info</h3>
              <div className="form-group">
                <label>Restaurant Name</label>
                <input type="text" name="name" value={formData.name || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Manager Name</label>
                <input type="text" name="manager_name" value={formData.manager_name || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Restaurant Type</label>
                <select name="restaurant_type" value={formData.restaurant_type || 'Both'} onChange={handleChange}>
                  <option value="Both">Both</option>
                  <option value="Veg">Veg</option>
                  <option value="Non-Veg">Non-Veg</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description || ''} onChange={handleChange} rows="4" />
              </div>
            </div>

            {/* Address & Contact */}
            <div className="section-box">
              <h3>Address & Contact</h3>
              <div className="form-group">
                <label>Address</label>
                <input type="text" name="address" value={formData.address || ''} onChange={handleChange} />
              </div>
              <div className="row">
                <div className="col form-group">
                  <label>City</label>
                  <input type="text" name="city" value={formData.city || ''} onChange={handleChange} />
                </div>
                <div className="col form-group">
                  <label>State</label>
                  <input type="text" name="state" value={formData.state || ''} onChange={handleChange} />
                </div>
                <div className="col-fixed form-group">
                  <label>Zip Code</label>
                  <input type="text" name="zip_code" value={formData.zip_code || ''} onChange={handleChange} />
                </div>
              </div>
              <div className="row">
                <div className="col form-group">
                  <label>Contact Number</label>
                  <input type="text" name="contact_number" value={formData.contact_number || ''} onChange={handleChange} />
                </div>
                <div className="col form-group">
                  <label>Email</label>
                  <input type="email" name="email" value={formData.email || ''} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Website URL</label>
                <input type="text" name="website_url" value={formData.website_url || ''} onChange={handleChange} />
              </div>
            </div>

            {/* Operational Details */}
            <div className="section-box">
              <h3>Operational Details</h3>
              <div className="form-group">
                <label>Operating Hours</label>
                <input type="text" name="operating_hours" value={formData.operating_hours || ''} onChange={handleChange} />
              </div>
              <div className="row">
                <div className="col form-group">
                  <label>Average Dining Duration</label>
                  <input type="text" name="avg_dining_duration" value={formData.avg_dining_duration || ''} onChange={handleChange} />
                </div>
                <div className="col-fixed form-group">
                  <label>Total Tables</label>
                  <input type="number" name="total_tables" value={formData.total_tables || ''} onChange={handleChange} />
                </div>
                <div className="col form-group">
                  <label>Table Capacity Range</label>
                  <input type="text" name="table_capacity_range" value={formData.table_capacity_range || ''} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Ambience Type</label>
                <input type="text" name="ambience_type" value={formData.ambience_type || ''} onChange={handleChange} />
              </div>
            </div>

            {/* Tags & Features */}
            <div className="section-box">
              <h3>Tags & Features</h3>
              <div className="form-group">
                <label>Cuisine Types</label>
                <input
                  type="text"
                  name="cuisine_types"
                  value={Array.isArray(formData.cuisine_types) ? formData.cuisine_types.join(', ') : ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cuisine_types: e.target.value
                        ? e.target.value.split(',').map((item) => item.trim())
                        : [],
                    })
                  }
                />
                <span className="helper-text">Enter values separated by commas</span>
              </div>
              <div className="form-group">
                <label>Special Areas</label>
                <input
                  type="text"
                  name="special_areas"
                  value={Array.isArray(formData.special_areas) ? formData.special_areas.join(', ') : ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      special_areas: e.target.value
                        ? e.target.value.split(',').map((item) => item.trim())
                        : [],
                    })
                  }
                />
                <span className="helper-text">Enter values separated by commas</span>
              </div>
              <div className="form-group">
                <label>Facilities</label>
                <input
                  type="text"
                  name="facilities"
                  value={Array.isArray(formData.facilities) ? formData.facilities.join(', ') : ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      facilities: e.target.value
                        ? e.target.value.split(',').map((item) => item.trim())
                        : [],
                    })
                  }
                />
                <span className="helper-text">Enter values separated by commas</span>
              </div>
            </div>

            {/* Media */}
            <div className="section-box">
              <h3>Media</h3>
              <div className="form-group">
                <label>Logo Image</label>
                {formData.logo_image_url && (
                  <div className="gallery-grid">
                    <img 
                      src={`http://localhost:5000/${formData.logo_image_url.replace(/\\/g, '/')}`}
                      alt="Current logo" 
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/400x250?text=No+Image';
                      }}
                    />
                  </div>
                )}
                <input
                  type="file"
                  name="logo_image"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, logo_image: e.target.files[0] })}
                />
              </div>
              <div className="form-group">
                <label>Gallery Images</label>
                <div className="gallery-grid">
                  {Array.isArray(formData.gallery) && formData.gallery.length > 0 ? (
                    formData.gallery.map((img, idx) => (
                      <img
                        key={idx}
                        src={`http://localhost:5000/${img}`}
                        alt={`Gallery ${idx + 1}`}
                        onError={e => { e.target.src = 'https://placehold.co/120x80?text=No+Image'; }}
                      />
                    ))
                  ) : (
                    <div className="no-images">No gallery images</div>
                  )}
                </div>
                <input
                  type="file"
                  name="gallery_images"
                  accept="image/*"
                  multiple
                  onChange={e => setFormData({ ...formData, gallery_images: e.target.files })}
                />
                <span className="helper-text">Upload new images to add to the gallery</span>
              </div>
            </div>

            <button type="button" className="reset-button" onClick={handleReset}>
              Reset Changes
            </button>

            <button type="submit" className="submit-button">
              Save Changes
            </button>
          </form>
        </main>
      </div>
    </>
  );
};

export default EditRestaurantPage;
