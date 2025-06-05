interface CitySelectorProps {
    cities: string[];
    selectedCity: string;
    isDropdownOpen: boolean;
    onCitySelect: (city: string) => void;
    onToggleDropdown: () => void;
}

export default function CitySelector({
    cities,
    selectedCity,
    isDropdownOpen,
    onCitySelect,
    onToggleDropdown
}: CitySelectorProps) {
    return (
        <div className="relative">
            {/* Dropdown cho thành phố */}
            <button
                onClick={onToggleDropdown}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded text-white hover:bg-gray-700"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {selectedCity || 'Chọn thành phố'}
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                        {cities.map((city) => (
                            <button
                                key={city}
                                onClick={() => onCitySelect(city)}
                                className={`block px-4 py-2 text-sm w-full text-left ${selectedCity === city
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                role="menuitem"
                            >
                                {city}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
