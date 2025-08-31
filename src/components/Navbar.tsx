import { useState } from "react";
import { ChevronDown } from "lucide-react";

const Navbar = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const navItems = [
    { name: "News", href: "#", active: true },
    { name: "Reviews", href: "#" },
    { name: "Opinions", href: "#" },
    {
      name: "Tech",
      href: "#",
      dropdown: ["Apple", "Samsung"]
    },
    {
      name: "Entertainments",
      href: "#",
      dropdown: ["MCU", "DCEU", "Netflix", "Amazon Prime"]
    },
    {
      name: "Auto",
      href: "#",
      dropdown: ["Bikes", "Cars"]
    }
  ];

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="tech-logo text-3xl">TECH Theory</h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <div
                key={index}
                className="relative"
                onMouseEnter={() => item.dropdown && setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <a
                  href={item.href}
                  className={`nav-link flex items-center space-x-1 font-medium text-sm ${
                    item.active ? "text-primary active" : "text-foreground"
                  }`}
                >
                  <span>{item.name}</span>
                  {item.dropdown && <ChevronDown className="w-4 h-4" />}
                </a>

                {/* Dropdown */}
                {item.dropdown && activeDropdown === item.name && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-card rounded-lg shadow-lg border border-border z-50">
                    <div className="py-2">
                      {item.dropdown.map((subItem, subIndex) => (
                        <a
                          key={subIndex}
                          href="#"
                          className="block px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                        >
                          {subItem}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <button className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Login
            </button>
            <button className="btn-primary px-4 py-2 rounded-lg text-sm font-medium">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;