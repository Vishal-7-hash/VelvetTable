import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRestaurant } from '../../services/api';
import OwnerSidebar from '../../components/layout/OwnerSidebar';
import Modal from '../../components/common/Modal';
import MultiSelectDropdown from '../../components/common/MultiSelectDropdown';
// import EditRestaurantPage from './EditRestaurantPage';
// import  AddRestaurantPage from './AddRestaurantPage';
import './AddRestaurantPage.css';


const AddRestaurantPage = () => {
    const [formData, setFormData] = useState({
        restaurant_type: 'Both',
        cuisine_types: [],
        special_areas: [],
        facilities: []
    });
    const [files, setFiles] = useState({ logo_image: null, gallery_images: null });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formSections, setFormSections] = useState({ basic: false, location: false, operating: false, table: false, media: false });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleMultiSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleFileChange = (e) => {
        setFiles({ ...files, [e.target.name]: e.target.files });
    };

    useEffect(() => {
    const { name, manager_name, restaurant_type, description } = formData;
    const isBasicComplete = !!(name && manager_name && restaurant_type && description && files.logo_image);
        
        const { address, city, state, zip_code, contact_number, email } = formData;
        const isLocationComplete = !!(address && city && state && zip_code && contact_number && email);

        const { operating_hours, avg_dining_duration } = formData;
        const isOperatingComplete = !!(operating_hours && avg_dining_duration);

        const { total_tables, table_capacity_range, special_areas } = formData;
        const isTableComplete = !!(total_tables && table_capacity_range && special_areas?.length > 0);

    const { ambience_type, facilities } = formData;
    const isMediaComplete = !!(ambience_type && facilities?.length > 0 && files.gallery_images);

        setFormSections({ 
            basic: isBasicComplete, 
            location: isLocationComplete,
            operating: isOperatingComplete,
            table: isTableComplete,
            media: isMediaComplete
        });
    }, [formData, files]);

const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();

        // This is the crucial change: We now join arrays into simple strings.
        for (const key in formData) {
            if (Array.isArray(formData[key])) {
                data.append(key, formData[key].join(','));
            } else {
                data.append(key, formData[key]);
            }
        }
        
        if (files.logo_image) {
            data.append('logo_image', files.logo_image[0]);
        }
        if (files.gallery_images) {
            for (let i = 0; i < files.gallery_images.length; i++) {
                data.append('gallery_images', files.gallery_images[i]);
            }
        }
        // menu_file removed — menu is no longer required or uploaded

        try {
            await createRestaurant(data);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Failed to create restaurant', error);
            // This now shows a more specific error from the backend if available
            alert(`Failed to submit restaurant. ${error.response?.data?.message || 'Please check all required fields and try again.'}`);
        }
    };

    return (
        <>
            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); navigate('/owner/dashboard'); }} title="Success!">
                <p>Your restaurant has been submitted for approval.</p>
            </Modal>
            <div className="owner-layout">
                <OwnerSidebar />
                <main className="owner-content">
                    <h1>Add New Restaurant</h1>
                    <form onSubmit={handleSubmit}>
                        {/* Section 1: Basic Details */}
                        <details open>
                            <summary className={formSections.basic ? 'section-complete' : ''}><h2>1. Basic Restaurant Details</h2></summary>
                            <div className="form-section">
                                <div className="form-group"><label>Restaurant Name*</label><input type="text" name="name" onChange={handleChange} required /></div>
                                <div className="form-group"><label>Manager Name*</label><input type="text" name="manager_name" onChange={handleChange} required /></div>
                                <div className="form-group"><label>Restaurant Type*</label><select name="restaurant_type" onChange={handleChange} defaultValue="Both" required><option value="Both">Both</option><option value="Veg">Veg</option><option value="Non-Veg">Non-Veg</option></select></div>
                                <div className="form-group"><label>Cuisine Type(s)*</label>
                                    <MultiSelectDropdown options={['Indian', 'Italian', 'Chinese', 'Continental', 'Mexican', 'Japanese', 'Thai', 'American', 'Mediterranean', 'French']} selected={formData.cuisine_types} onChange={(value) => handleMultiSelectChange('cuisine_types', value)} placeholder="Select cuisines..." />
                                </div>
                                <div className="form-group" style={{gridColumn: '1 / -1'}}><label>Description / About*</label><textarea name="description" rows="5" onChange={handleChange} required></textarea></div>
                                <div className="form-group"><label>Logo / Cover Image*</label><input type="file" name="logo_image" onChange={handleFileChange} required /></div>
                            </div>
                        </details>

                        {/* Section 2: Location & Contact */}
                        <details open><summary className={formSections.location ? 'section-complete' : ''}><h2>2. Location & Contact</h2></summary>
                            <div className="form-section">
                                <div className="form-group"><label>Address*</label><input type="text" name="address" onChange={handleChange} required /></div>
                                <div className="form-group"><label>City*</label><input type="text" name="city" onChange={handleChange} required /></div>
                                <div className="form-group"><label>State*</label><input type="text" name="state" onChange={handleChange} required /></div>
                                <div className="form-group"><label>ZIP Code*</label><input type="text" name="zip_code" onChange={handleChange} required /></div>
                                <div className="form-group"><label>Contact Number*</label><input type="tel" name="contact_number" onChange={handleChange} required /></div>
<div className="form-group"><label>Restaurant Email*</label><input type="email" name="email" onChange={handleChange} required /></div>
                                <div className="form-group"><label>Website/Social Media (Optional)</label><input type="text" name="website_url" onChange={handleChange} /></div>
                            </div>
                        </details>
                        
                        {/* Section 3: Operating Details */}
                        <details><summary className={formSections.operating ? 'section-complete' : ''}><h2>3. Operating Details</h2></summary>
                           <div className="form-section">
                                <div className="form-group"><label>Opening & Closing Hours (e.g., 11:00-22:00)*</label><input type="text" name="operating_hours" onChange={handleChange} required /></div>
                                <div className="form-group"><label>Average Dining Duration (in minutes)*</label><input type="number" name="avg_dining_duration" onChange={handleChange} required /></div>
                           </div>
                        </details>

                        {/* Section 4: Table Information */}
                        <details><summary className={formSections.table ? 'section-complete' : ''}><h2>4. Table Information</h2></summary>
                           <div className="form-section">
                               <div className="form-group"><label>Total Number of Tables*</label><input type="number" name="total_tables" onChange={handleChange} required /></div>
                               <div className="form-group"><label>Table Capacity Range*</label><input type="text" name="table_capacity_range" placeholder="e.g., 2-seater, 4-seater" onChange={handleChange} required /></div>
                               <div className="form-group"><label>Special Areas*</label>
                                   <MultiSelectDropdown options={['Outdoor', 'Rooftop', 'AC', 'Private Dining', 'Bar Seating']} selected={formData.special_areas} onChange={(value) => handleMultiSelectChange('special_areas', value)} placeholder="Select special areas..."/>
                                </div>
                           </div>
                        </details>

                        {/* Section 5: Media & Ambience */}
                        <details><summary className={formSections.media ? 'section-complete' : ''}><h2>5. Media & Ambience</h2></summary>
                           <div className="form-section">
                                <div className="form-group"><label>Ambience Type*</label><input type="text" name="ambience_type" placeholder="e.g., Casual, Fine Dining, Romantic" onChange={handleChange} required /></div>
                                <div className="form-group"><label>Facilities*</label>
                                    <MultiSelectDropdown options={['Wi-Fi', 'Parking', 'Live Music', 'Bar Available', 'Wheelchair Accessible', 'Card Payment', 'Digital Payment']} selected={formData.facilities} onChange={(value) => handleMultiSelectChange('facilities', value)} placeholder="Select facilities..."/>
                                </div>
                                <div className="form-group" style={{gridColumn: '1 / -1'}}><label>Upload Multiple Gallery Photos*</label><input type="file" name="gallery_images" onChange={handleFileChange} multiple /></div>
                           </div>
                        </details>

                        <button type="submit" className="btn btn-primary" style={{marginTop: '2rem'}}>Submit for Approval</button>
                    </form>
                </main>
            </div>
        </>
    );
};

export default AddRestaurantPage;
