
import PropTypes from 'prop-types';

const CategoryButton = ({ name, onClick }) => (
  <button onClick={onClick} className="p-2 m-2 bg-blue-500 text-white rounded">
    {name}
  </button>
);

CategoryButton.propTypes = {
  name: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default CategoryButton;