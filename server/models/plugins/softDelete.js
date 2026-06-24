export const softDeletePlugin = (schema) => {
  schema.add({
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
  });

  // Filter out deleted items in query middleware
  const filterDeleted = function (next) {
    const filters = this.getFilter();
    if (filters.isDeleted === undefined) {
      this.where({ isDeleted: { $ne: true } });
    }
    next();
  };

  schema.pre('find', filterDeleted);
  schema.pre('findOne', filterDeleted);
  schema.pre('findOneAndUpdate', filterDeleted);
  schema.pre('countDocuments', filterDeleted);

  // Instance method for soft delete
  schema.methods.softDelete = async function () {
    this.isDeleted = true;
    this.deletedAt = new Date();
    return this.save();
  };
};
