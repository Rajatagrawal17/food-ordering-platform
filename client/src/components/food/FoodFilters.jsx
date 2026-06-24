import { SelectField } from '../forms/SelectField';
import { TextField } from '../forms/TextField';

export const FoodFilters = ({ search, category, availability, categories = [], onChange }) => {
  return (
    <div className="menu-toolbar">
      <div className="menu-toolbar__row">
        <TextField
          label="Search"
          placeholder="Search dishes, ingredients, cuisines"
          value={search}
          onChange={(event) => onChange({ search: event.target.value })}
        />
        <SelectField label="Category" value={category} onChange={(event) => onChange({ category: event.target.value })}>
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item.slug ?? item.name} value={item.name}>
              {item.name}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Availability"
          value={availability}
          onChange={(event) => onChange({ availability: event.target.value })}
        >
          <option value="">All items</option>
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </SelectField>
        <SelectField label="Sort" value="newest" onChange={(event) => onChange({ sort: event.target.value })}>
          <option value="newest">Newest</option>
          <option value="popular">Top rated</option>
          <option value="price_low">Price: low to high</option>
          <option value="price_high">Price: high to low</option>
        </SelectField>
      </div>
    </div>
  );
};