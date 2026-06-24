import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../services/profileService';
import { Button } from '../components/common/Button';
import { TextField } from '../components/forms/TextField';

export default function ProfilePage() {
  const { user, token } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [addressForm, setAddressForm] = useState({ label: '', street: '', city: '', state: '', postalCode: '', isDefault: false });
  const [addresses, setAddresses] = useState([]);
  const [editingAddressIdx, setEditingAddressIdx] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name ?? '', phone: user.phone ?? '' });
      setAddresses(user.addresses ?? []);
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await profileService.updateProfile(profileForm);
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to update profile.');
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      let updatedAddresses;
      if (editingAddressIdx !== null) {
        updatedAddresses = await profileService.updateAddress(editingAddressIdx, addressForm);
        setEditingAddressIdx(null);
      } else {
        updatedAddresses = await profileService.addAddress(addressForm);
      }
      setAddresses(updatedAddresses ?? []);
      setAddressForm({ label: '', street: '', city: '', state: '', postalCode: '', isDefault: false });
      setSuccess('Address saved successfully.');
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to save address.');
    }
  };

  const handleEditAddress = (idx) => {
    setEditingAddressIdx(idx);
    setAddressForm(addresses[idx]);
  };

  const handleDeleteAddress = async (idx) => {
    setError(null);
    setSuccess(null);
    try {
      const updatedAddresses = await profileService.deleteAddress(idx);
      setAddresses(updatedAddresses ?? []);
      setSuccess('Address deleted successfully.');
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to delete address.');
    }
  };

  return (
    <section className="page profile-grid">
      <div className="page__hero">
        <span className="page__eyebrow">Personal settings</span>
        <h1 className="page__title">My Profile</h1>
      </div>

      <div className="profile-layout">
        <div className="panel form-card">
          <h3>Account Information</h3>
          <form className="form-stack" onSubmit={handleProfileSubmit}>
            <TextField label="Name" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
            <TextField label="Phone Number" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
            {error && <div className="field__error">{error}</div>}
            {success && <div className="field__success" style={{ color: 'green' }}>{success}</div>}
            <Button type="submit">Update Account</Button>
          </form>
        </div>

        <div className="panel form-card" style={{ marginTop: '24px' }}>
          <h3>{editingAddressIdx !== null ? 'Edit Address' : 'Add New Address'}</h3>
          <form className="form-stack" onSubmit={handleAddressSubmit}>
            <TextField label="Label (e.g. Home, Work)" value={addressForm.label} onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })} />
            <TextField label="Street Address" value={addressForm.street} onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })} />
            <TextField label="City" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} />
            <TextField label="State" value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} />
            <TextField label="Postal Code" value={addressForm.postalCode} onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })} />
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
              <input type="checkbox" checked={addressForm.isDefault} onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })} />
              <span>Set as default address</span>
            </label>

            <div style={{ display: 'flex', gap: '12px', marginTop: '18px' }}>
              <Button type="submit">{editingAddressIdx !== null ? 'Save Changes' : 'Add Address'}</Button>
              {editingAddressIdx !== null && (
                <Button type="button" variant="secondary" onClick={() => {
                  setEditingAddressIdx(null);
                  setAddressForm({ label: '', street: '', city: '', state: '', postalCode: '', isDefault: false });
                }}>Cancel</Button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="panel addresses-section" style={{ marginTop: '24px' }}>
        <h3>Saved Addresses</h3>
        {addresses.length === 0 ? (
          <p className="muted">No addresses saved yet.</p>
        ) : (
          <div className="grid">
            {addresses.map((addr, idx) => (
              <div key={idx} className="address-card" style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px', position: 'relative' }}>
                {addr.isDefault && <span className="badge badge--good" style={{ position: 'absolute', top: '12px', right: '12px' }}>Default</span>}
                <strong>{addr.label || 'Address'}</strong>
                <p style={{ margin: '8px 0' }}>
                  {addr.street}, {addr.city}, {addr.state} - {addr.postalCode}
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={() => handleEditAddress(idx)} style={{ color: '#ff7f32', border: 'none', background: 'none', cursor: 'pointer' }}>Edit</button>
                  <button type="button" onClick={() => handleDeleteAddress(idx)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
