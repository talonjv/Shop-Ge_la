import page from "../assets/page.png"

const menuItems = [
  {
    title: "Đồ nữ",
    items: ["Home Style 1", "Home Style 2", "Home Style 3"],
    newItems: ["Home Style 3"],
  },
  {
    title: "Đồ nam",
    items: ["Blog Style 1", "Blog Style 2", "Blog Style 3", "Blog Style 4", "Blog Style 5"],
    newItems: ["Blog Style 1", "Blog Style 3"],
  },
  {
    title: "Đồ trẻ em",
    items: ["Product Style 1", "Product Style 2", "Product Style 3", "Product Style 4", "Product Style 5"],
    newItems: ["Product Style 4"],
  },
  {
    title: "Đồ người già",
    items: ["Header Style 1", "Header Style 2", "Header Style 3"],
    newItems: ["Header Style 2"],
  },
];

const offers = [
  { title: "Special Offer", img:page },
  { title: "New Product", img: page },
  { title: "Featured Product", img: page },
  { title: "Coming Soon", img: page },
];

const Menu = () => {
  return (
    <div className="flex p-8">
      {/* Menu List */}
      <div className="flex-1 grid grid-cols-4 gap-6">
        {menuItems.map((category, index) => (
          <div key={index}>
            <h2 className="font-bold text-lg mb-2">{category.title}</h2>
            <ul>
              {category.items.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  {item}
                  {category.newItems.includes(item) && (
                    <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">New</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {/* Image Grid */}
      <div className="grid grid-cols-2 gap-4 ml-8">
        {offers.map((offer, index) => (
          <div key={index} className="relative">
            <img src={offer.img} alt={offer.title} className="rounded-lg w-[300px] " />
            <div className="absolute bottom-1 left-2 bg-white px-3 py-2 rounded-md shadow-md font-bold">
              {offer.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menu;