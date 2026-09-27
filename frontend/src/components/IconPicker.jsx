import React, { useState, useRef, useEffect } from 'react';
import { 
  Scissors, Brush, Sparkles, Droplets, Flame, Wind, 
  SprayCan, Crown, Gem, Star, Heart, Zap,
  Sun, Moon, Award, Gift, Palette, Droplet,
  Watch, Shirt, ShoppingBag, Package, Coffee, Leaf,
  Feather, Waves, CircleDot, Hexagon, Triangle,
  Anchor, Bomb, Cherry, Citrus, Cookie, Croissant,
  Egg, Fish, Grape, IceCream, Lollipop, Pizza,
  Popcorn, Beef, Carrot, Milk, UtensilsCrossed
} from 'lucide-react';

const iconList = [
  { key: 'scissors', Icon: Scissors, label: 'Gunting', category: 'layanan' },
  { key: 'brush', Icon: Brush, label: 'Sikat', category: 'layanan' },
  { key: 'sparkles', Icon: Sparkles, label: 'Berkilau', category: 'layanan' },
  { key: 'droplets', Icon: Droplets, label: 'Air/Cuci', category: 'layanan' },
  { key: 'flame', Icon: Flame, label: 'Api/Pomade', category: 'layanan' },
  { key: 'wind', Icon: Wind, label: 'Hair Dryer', category: 'layanan' },
  { key: 'sprayCan', Icon: SprayCan, label: 'Semprot', category: 'layanan' },
  { key: 'crown', Icon: Crown, label: 'Premium/VIP', category: 'layanan' },
  { key: 'star', Icon: Star, label: 'Bintang', category: 'layanan' },
  { key: 'award', Icon: Award, label: 'Penghargaan', category: 'layanan' },
  { key: 'gem', Icon: Gem, label: 'Permata', category: 'layanan' },
  { key: 'heart', Icon: Heart, label: 'Favorit', category: 'layanan' },
  { key: 'zap', Icon: Zap, label: 'Cepat', category: 'layanan' },
  { key: 'droplet', Icon: Droplet, label: 'Tetes', category: 'layanan' },
  
  { key: 'package', Icon: Package, label: 'Paket', category: 'produk' },
  { key: 'shoppingBag', Icon: ShoppingBag, label: 'Tas Belanja', category: 'produk' },
  { key: 'gift', Icon: Gift, label: 'Hadiah', category: 'produk' },
  { key: 'palette', Icon: Palette, label: 'Warna', category: 'produk' },
  { key: 'leaf', Icon: Leaf, label: 'Alami', category: 'produk' },
  { key: 'feather', Icon: Feather, label: 'Lembut', category: 'produk' },
  { key: 'waves', Icon: Waves, label: 'Gelombang', category: 'produk' },
  { key: 'sun', Icon: Sun, label: 'Sinar', category: 'produk' },
  { key: 'moon', Icon: Moon, label: 'Malam', category: 'produk' },
  { key: 'coffee', Icon: Coffee, label: 'Kopi', category: 'produk' },
  { key: 'watch', Icon: Watch, label: 'Jam/Aksesoris', category: 'produk' },
  { key: 'shirt', Icon: Shirt, label: 'Baju/Apron', category: 'produk' },
  
  { key: 'cookie', Icon: Cookie, label: 'Biskuit', category: 'makanan' },
  { key: 'croissant', Icon: Croissant, label: 'Croissant', category: 'makanan' },
  { key: 'egg', Icon: Egg, label: 'Telur', category: 'makanan' },
  { key: 'fish', Icon: Fish, label: 'Ikan', category: 'makanan' },
  { key: 'beef', Icon: Beef, label: 'Daging', category: 'makanan' },
  { key: 'carrot', Icon: Carrot, label: 'Wortel', category: 'makanan' },
  { key: 'milk', Icon: Milk, label: 'Susu', category: 'makanan' },
  { key: 'citrus', Icon: Citrus, label: 'Jeruk', category: 'makanan' },
  { key: 'cherry', Icon: Cherry, label: 'Cherry', category: 'makanan' },
  { key: 'grape', Icon: Grape, label: 'Anggur', category: 'makanan' },
  { key: 'iceCream', Icon: IceCream, label: 'Es Krim', category: 'makanan' },
  { key: 'lollipop', Icon: Lollipop, label: 'Permen', category: 'makanan' },
  { key: 'pizza', Icon: Pizza, label: 'Pizza', category: 'makanan' },
  { key: 'popcorn', Icon: Popcorn, label: 'Popcorn', category: 'makanan' },
  { key: 'utensilsCrossed', Icon: UtensilsCrossed, label: 'Makanan', category: 'makanan' },
  
  { key: 'circleDot', Icon: CircleDot, label: 'Titik', category: 'bentuk' },
  { key: 'hexagon', Icon: Hexagon, label: 'Hexagon', category: 'bentuk' },
  { key: 'triangle', Icon: Triangle, label: 'Segitiga', category: 'bentuk' },
  { key: 'bomb', Icon: Bomb, label: 'Bom', category: 'bentuk' },
  { key: 'anchor', Icon: Anchor, label: 'Jangkar', category: 'bentuk' },
];

const iconMap = {};
iconList.forEach(item => {
  iconMap[item.key] = item;
});

const IconPicker = ({ value, onChange, label = "Pilih Icon" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const pickerRef = useRef(null);
  
  const selectedItem = value && iconMap[value] ? iconMap[value] : null;
  const SelectedIcon = selectedItem?.Icon || Scissors;

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const filteredIcons = iconList.filter(item => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  const categories = [
    { key: 'all', label: 'Semua' },
    { key: 'layanan', label: 'Layanan' },
    { key: 'produk', label: 'Produk' },
    { key: 'makanan', label: 'Makanan' },
  ];

  const handleIconClick = (key) => {
    console.log('Icon clicked:', key);
    onChange(key);
    setIsOpen(false);
  };

  return (
    <div ref={pickerRef}>
      <label className="block text-sm font-medium text-secondary-700 mb-2">{label}</label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-3 border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors text-left"
      >
        {selectedItem ? (
          <>
            <div className="p-2 bg-primary-100 rounded-lg">
              <SelectedIcon className="h-5 w-5 text-primary-600" />
            </div>
            <span className="text-secondary-900">{selectedItem.label}</span>
          </>
        ) : (
          <>
            <div className="p-2 bg-secondary-100 rounded-lg">
              <Scissors className="h-5 w-5 text-secondary-400" />
            </div>
            <span className="text-secondary-500">Pilih icon...</span>
          </>
        )}
      </button>

      {isOpen && (
        <div className="mt-2 p-3 bg-white border border-secondary-200 rounded-lg shadow-lg z-50 relative">
          {/* Category Tabs */}
          <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
            {categories.map(cat => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveCategory(cat.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                  activeCategory === cat.key 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          
          {/* Icon Grid */}
          <div className="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto p-1">
            {filteredIcons.map((item) => {
              const Icon = item.Icon;
              const isSelected = value === item.key;
              
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleIconClick(item.key)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all border ${
                    isSelected 
                      ? 'bg-primary-100 border-primary-500 ring-2 ring-primary-200' 
                      : 'bg-white border-transparent hover:bg-secondary-50 hover:border-secondary-200'
                  }`}
                  title={item.label}
                >
                  <Icon className={`h-5 w-5 ${isSelected ? 'text-primary-600' : 'text-secondary-600'}`} />
                  <span className="text-[9px] text-secondary-500 truncate w-full text-center leading-tight">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default IconPicker;
export { iconMap };
