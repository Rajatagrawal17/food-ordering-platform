import { userRepository } from '../repositories/userRepository.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;

  if (!name) {
    throw new ApiError(400, 'Name is required');
  }

  const user = await userRepository.updateById(req.user._id, { name, phone });

  res.status(200).json({
    success: true,
    data: user,
  });
});

export const addAddress = asyncHandler(async (req, res) => {
  const { label, street, city, state, postalCode, country, isDefault } = req.body;

  if (!street || !city || !state || !postalCode) {
    throw new ApiError(400, 'Street, city, state, and postal code are required');
  }

  const user = await userRepository.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const newAddress = { label, street, city, state, postalCode, country: country ?? 'India', isDefault: Boolean(isDefault) };

  if (newAddress.isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  user.addresses.push(newAddress);
  await user.save();

  res.status(201).json({
    success: true,
    data: user.addresses,
  });
});

export const updateAddress = asyncHandler(async (req, res) => {
  const index = Number(req.params.index);
  const { label, street, city, state, postalCode, country, isDefault } = req.body;

  if (!street || !city || !state || !postalCode) {
    throw new ApiError(400, 'Street, city, state, and postal code are required');
  }

  const user = await userRepository.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (index < 0 || index >= user.addresses.length) {
    throw new ApiError(400, 'Invalid address index');
  }

  const targetAddress = user.addresses[index];
  targetAddress.label = label ?? targetAddress.label;
  targetAddress.street = street;
  targetAddress.city = city;
  targetAddress.state = state;
  targetAddress.postalCode = postalCode;
  targetAddress.country = country ?? targetAddress.country;
  targetAddress.isDefault = isDefault !== undefined ? Boolean(isDefault) : targetAddress.isDefault;

  if (targetAddress.isDefault) {
    user.addresses.forEach((addr, idx) => {
      if (idx !== index) {
        addr.isDefault = false;
      }
    });
  }

  await user.save();

  res.status(200).json({
    success: true,
    data: user.addresses,
  });
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const index = Number(req.params.index);
  const user = await userRepository.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (index < 0 || index >= user.addresses.length) {
    throw new ApiError(400, 'Invalid address index');
  }

  user.addresses.splice(index, 1);
  await user.save();

  res.status(200).json({
    success: true,
    data: user.addresses,
  });
});
