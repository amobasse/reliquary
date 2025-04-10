import React, { useState, useEffect } from "react";
import fs from "fs";

// Types
type Position = {
  x: number;
  y: number;
};

type Size = {
  width: number;
  height: number;
};

type ItemProperty = {
  name: string;
  value: string;
  color?: string;
};

type Item = {
  id: string;
  name: string;
  position: Position;
  size: Size;
  imageUrl: string;
  rarity?:
    | "common"
    | "uncommon"
    | "rare"
    | "very rare"
    | "epic"
    | "unique"
    | "set"
    | "legendary";
  properties: ItemProperty[];
  sounds?: {
    pickup?: string;
    drop?: string;
  };
};

// Constants
const CELL_SIZE = 40;
const GRID_WIDTH = 10;
const GRID_HEIGHT = 10;
const SAVE_FILE_PATH = "src/data/inventory_save.json"; // Path for local save file
const ITEM_VAULT_PATH = "src/data/item_vault.json";

// Load inventory from file or use defaults
const loadInventory = (): Item[] => {
  try {
    // Check if running in browser
    if (typeof window !== "undefined") {
      // Try to load from localStorage first
      const savedInventory = localStorage.getItem("dndInventory");
      if (savedInventory) {
        console.log("Loaded inventory from localStorage");
        return JSON.parse(savedInventory);
      }
    }

    // For Node.js environments (only works with proper environment setup)
    if (
      typeof process !== "undefined" &&
      process.versions &&
      process.versions.node
    ) {
      try {
        // Using dynamic import with type assertion
        const fs = (window as any).require
          ? (window as any).require("fs")
          : null;
        if (fs && fs.existsSync && fs.existsSync(SAVE_FILE_PATH)) {
          const data = fs.readFileSync(SAVE_FILE_PATH, "utf8");
          console.log("Loaded inventory from file");
          return JSON.parse(data);
        }
      } catch (error) {
        console.log("File loading not available:", error);
      }
    }
  } catch (error) {
    console.error("Error loading inventory:", error);
  }

  // Return default items if nothing could be loaded
  console.log("Using default inventory");
  return defaultItems;
}; // Function to play sounds

const playSound = (url?: string) => {
  if (!url) return;

  try {
    const sound = new Audio(url);
    sound.volume = 0.3;
    sound.play().catch((e) => console.log("Error playing sound:", e));
  } catch (error) {
    console.log("Error initializing sound:", error);
  }
};

// Save inventory to file
const saveInventory = (items: Item[]) => {
  try {
    // Save to localStorage for browser environments
    if (typeof window !== "undefined") {
      localStorage.setItem("dndInventory", JSON.stringify(items));
      console.log("Saved inventory to localStorage");
    }

    // For Node.js/Electron environments
    if (
      typeof process !== "undefined" &&
      process.versions &&
      process.versions.node
    ) {
      try {
        const fs = (window as any).require
          ? (window as any).require("fs")
          : null;
        if (fs && fs.writeFileSync) {
          fs.writeFileSync(
            SAVE_FILE_PATH,
            JSON.stringify(items, null, 2),
            "utf8"
          );
          console.log("Saved inventory to file");
        }
      } catch (error) {
        console.log("File saving not available:", error);
      }
    }
  } catch (error) {
    console.error("Error saving inventory:", error);
  }
};

// Default items to use when no save file exists
const defaultItems: Item[] = [
  {
    id: "1",
    name: "Potion of Healing",
    position: { x: 0, y: 0 },
    size: { width: 1, height: 1 },
    imageUrl: "/api/placeholder/40/40",
    rarity: "common",
    properties: [
      { name: "Type", value: "Consumable" },
      { name: "Effect", value: "Restores 2d4+2 hit points" },
      { name: "Duration", value: "Instant" },
      { name: "Weight", value: "0.5 lb" },
      { name: "Value", value: "50 gp" },
    ],
    sounds: {
      pickup: "https://example.com/sounds/potion_pickup.mp3",
      drop: "https://example.com/sounds/potion_drop.mp3",
    },
  },
  {
    id: "2",
    name: "Longsword",
    position: { x: 1, y: 2 },
    size: { width: 1, height: 3 },
    imageUrl: "/api/placeholder/40/120",
    rarity: "uncommon",
    properties: [
      { name: "Damage", value: "1d8 slashing", color: "#44bb44" },
      {
        name: "Property",
        value: "+1 to attack and damage rolls",
        color: "#44bb44",
      },
      { name: "Weight", value: "3 lb" },
      { name: "Value", value: "1,000 gp" },
      { name: "Type", value: "Melee Weapon" },
    ],
    sounds: {
      pickup: "https://example.com/sounds/sword_pickup.mp3",
      drop: "https://example.com/sounds/sword_drop.mp3",
    },
  },
  {
    id: "3",
    name: "Shield of Protection",
    position: { x: 3, y: 3 },
    size: { width: 2, height: 2 },
    imageUrl: "/api/placeholder/80/80",
    rarity: "rare",
    properties: [
      { name: "Armor Class", value: "+2 AC", color: "#4444dd" },
      {
        name: "Property",
        value: "Advantage on saving throws",
        color: "#4444dd",
      },
      {
        name: "Special",
        value: "Resistance to one damage type",
        color: "#4444dd",
      },
      { name: "Weight", value: "6 lb" },
      { name: "Value", value: "5,000 gp" },
    ],
    sounds: {
      pickup: "https://example.com/sounds/shield_pickup.mp3",
      drop: "https://example.com/sounds/shield_drop.mp3",
    },
  },
  {
    id: "4",
    name: "Tome of Fire",
    position: { x: 6, y: 0 },
    size: { width: 2, height: 2 },
    imageUrl: "/api/placeholder/80/80",
    rarity: "epic",
    properties: [
      { name: "Type", value: "Spellbook" },
      { name: "School", value: "Evocation", color: "#aa44ee" },
      {
        name: "Property",
        value: "+2 to spell save DC for fire spells",
        color: "#aa44ee",
      },
      {
        name: "Property",
        value: "Contains 12 fire-based spells",
        color: "#aa44ee",
      },
      { name: "Weight", value: "3 lb" },
      { name: "Value", value: "10,000 gp" },
    ],
    sounds: {
      pickup: "https://example.com/sounds/book_pickup.mp3",
      drop: "https://example.com/sounds/book_drop.mp3",
    },
  },
  {
    id: "5",
    name: "Dragonscale Platemail",
    position: { x: 6, y: 5 },
    size: { width: 2, height: 3 },
    imageUrl: "/api/placeholder/80/120",
    rarity: "set",
    properties: [
      {
        name: "Armor Class",
        value: "18 + Dex modifier (max 1)",
        color: "#dd4444",
      },
      { name: "Resistance", value: "Fire damage", color: "#dd4444" },
      {
        name: "Property",
        value: "Advantage on saves vs. fear",
        color: "#dd4444",
      },
      {
        name: "Special",
        value: "Once per day, cast Fire Shield",
        color: "#dd4444",
      },
      { name: "Weight", value: "65 lb" },
      { name: "Value", value: "25,000 gp" },
      { name: "Requirement", value: "Str 15" },
    ],
    sounds: {
      pickup: "https://example.com/sounds/armor_pickup.mp3",
      drop: "https://example.com/sounds/armor_drop.mp3",
    },
  },
];

const DiabloInventory = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [draggedItem, setDraggedItem] = useState<Item | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState<Position>({ x: 0, y: 0 });
  const [isColliding, setIsColliding] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<Item | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<Position>({
    x: 0,
    y: 0,
  });

  // Load inventory on component mount
  useEffect(() => {
    const loadedItems = loadInventory();
    setItems(loadedItems);
  }, []);

  // Save inventory whenever items change
  useEffect(() => {
    // Skip saving on initial mount
    if (items.length > 0) {
      saveInventory(items);
    }
  }, [items]);

  // Check if position is valid for an item (fits in grid and doesn't overlap)
  const isValidPosition = (item: Item, position: Position): boolean => {
    // Check grid boundaries
    if (
      position.x < 0 ||
      position.y < 0 ||
      position.x + item.size.width > GRID_WIDTH ||
      position.y + item.size.height > GRID_HEIGHT
    ) {
      return false;
    }

    // Check collision with other items
    for (const otherItem of items) {
      if (otherItem.id === item.id) continue;

      if (
        position.x < otherItem.position.x + otherItem.size.width &&
        position.x + item.size.width > otherItem.position.x &&
        position.y < otherItem.position.y + otherItem.size.height &&
        position.y + item.size.height > otherItem.position.y
      ) {
        return false;
      }
    }

    return true;
  };

  // Snap position to grid
  const snapToGrid = (x: number, y: number): Position => {
    const gridX = Math.floor(x / CELL_SIZE);
    const gridY = Math.floor(y / CELL_SIZE);
    return { x: gridX, y: gridY };
  };

  // Handle mouse down on an item
  const handleMouseDown = (e: React.MouseEvent, item: Item) => {
    e.preventDefault();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    // Play pickup sound if available
    playSound(item.sounds?.pickup);

    setDraggedItem(item);
    setHoveredItem(null); // Clear hovered item when starting to drag
    setDragOffset({
      x: Math.floor(offsetX / CELL_SIZE) * CELL_SIZE,
      y: Math.floor(offsetY / CELL_SIZE) * CELL_SIZE,
    });
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  // Handle mouse move - works on the entire document to track the mouse even outside the inventory
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (draggedItem) {
        setMousePosition({ x: e.clientX, y: e.clientY });

        // Only calculate collision if mouse is inside the inventory
        const inventoryRect = document
          .getElementById("inventory-grid")
          ?.getBoundingClientRect();
        if (
          inventoryRect &&
          e.clientX >= inventoryRect.left &&
          e.clientX <= inventoryRect.right &&
          e.clientY >= inventoryRect.top &&
          e.clientY <= inventoryRect.bottom
        ) {
          const relativeX = e.clientX - inventoryRect.left - dragOffset.x;
          const relativeY = e.clientY - inventoryRect.top - dragOffset.y;

          const snappedPosition = snapToGrid(relativeX, relativeY);
          setIsColliding(!isValidPosition(draggedItem, snappedPosition));
        } else {
          setIsColliding(false);
        }
      }
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (!draggedItem) return;

      // Store reference to play drop sound
      const currentItem = draggedItem;

      const inventoryRect = document
        .getElementById("inventory-container")
        ?.getBoundingClientRect();

      if (!inventoryRect) {
        setDraggedItem(null);
        setHoveredItem(null);
        return;
      }

      // Check if mouse is outside the inventory container
      const isOutside =
        e.clientX < inventoryRect.left ||
        e.clientX > inventoryRect.right ||
        e.clientY < inventoryRect.top ||
        e.clientY > inventoryRect.bottom;

      if (isOutside) {
        // Remove the item from inventory when dropped outside
        setItems(items.filter((item) => item.id !== draggedItem.id));
        setDraggedItem(null);
        setHoveredItem(null);
        setIsColliding(false);

        // Play drop sound if available
        playSound(currentItem.sounds?.drop);
        return;
      }

      // For valid placement inside the grid, we need the grid coordinates
      const gridRect = document
        .getElementById("inventory-grid")
        ?.getBoundingClientRect();
      if (!gridRect) {
        setDraggedItem(null);
        setHoveredItem(null);
        return;
      }

      // Normal placement inside the grid
      const relativeX = e.clientX - gridRect.left - dragOffset.x;
      const relativeY = e.clientY - gridRect.top - dragOffset.y;

      const snappedPosition = snapToGrid(relativeX, relativeY);

      if (isValidPosition(draggedItem, snappedPosition)) {
        setItems(
          items.map((item) =>
            item.id === draggedItem.id
              ? { ...item, position: snappedPosition }
              : item
          )
        );
      }

      // Play drop sound if available
      playSound(currentItem.sounds?.drop);

      setDraggedItem(null);
      setHoveredItem(null);
      setIsColliding(false);
    };

    document.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [draggedItem, dragOffset, items]);

  // This can be simplified since we now handle move/up at document level
  const handleMouseMove = (e: React.MouseEvent) => {
    // This is handled by the global mouse move handler
  };

  // This can be simplified since we now handle move/up at document level
  const handleMouseUp = (e: React.MouseEvent) => {
    // This is handled by the global mouse up handler
  };

  // Handle mouse over for tooltip
  const handleMouseOver = (e: React.MouseEvent, item: Item) => {
    e.stopPropagation(); // Prevent event bubbling
    setHoveredItem(item);
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  // Handle mouse out for tooltip
  const handleMouseOut = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    setHoveredItem(null);
  };

  // Handle mouse move for tooltip positioning
  const handleTooltipMouseMove = (e: React.MouseEvent) => {
    if (hoveredItem) {
      setTooltipPosition({ x: e.clientX, y: e.clientY });
    }
  };

  // Get border color based on item rarity
  const getRarityColor = (rarity?: string): string => {
    switch (rarity) {
      case "common":
        return "#cccccc";
      case "uncommon":
        return "#89CFF0"; //blue
      case "rare":
        return "#4444dd"; //yellow
      case "very rare":
        return "#CD7F32"; //bronze
      case "set":
        return "#00FF00"; //green
      case "unique":
        return "#FFD700"; //gold
      case "epic":
        return "#aa44ee"; //purple
      case "legendary":
        return "#FFA500"; //orange
      default:
        return "#5a3807";
    }
  };

  // Implement a standalone Tooltip component
  const ItemTooltip = ({
    item,
    position,
  }: {
    item: Item;
    position: Position;
  }) => {
    const rarityColors = {
      common: "text-gray-200",
      uncommon: "text-blue-400",
      rare: "text-yellow-400",
      "very rare": "text-bronze-400",
      set: "text-green-400",
      epic: "text-purple-400",
      unique: "text-gold-400",
      legendary: "text-orange-400",
    };

    const rarityColor = item.rarity
      ? rarityColors[item.rarity]
      : "text-gray-200";

    return (
      <div
        className="absolute bg-gray-900 bg-opacity-90 border-2 rounded p-3 shadow-lg pointer-events-none"
        style={{
          left: `${position.x + CELL_SIZE}px`,
          top: `${position.y}px`,
          borderColor: getRarityColor(item.rarity),
          width: "240px",
          zIndex: 100,
        }}
      >
        <h3 className={`text-lg font-bold mb-1 ${rarityColor}`}>{item.name}</h3>
        <div className="w-full h-px bg-gray-700 mb-2"></div>
        {item.properties.map((prop, index) => (
          <div key={index} className="flex justify-between mb-1">
            <span className="text-gray-400">{prop.name}:</span>
            <span style={{ color: prop.color || "#ffffff" }}>{prop.value}</span>
          </div>
        ))}
        <div className="w-full h-px bg-gray-700 my-2"></div>
        <div className="text-xs text-gray-500 italic">
          {item.rarity
            ? item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)
            : "Common"}{" "}
          item
        </div>
      </div>
    );
  };

  // Add a new random item to inventory
  const addRandomItem = () => {
    const itemTypes = [
      {
        name: "Small Potion",
        size: { width: 1, height: 1 },
        imageUrl: "/api/placeholder/40/40",
        rarity: "common",
        properties: [
          { name: "Type", value: "Consumable" },
          { name: "Effect", value: "Restores 1d4 hit points" },
          { name: "Weight", value: "0.25 lb" },
        ],
        sounds: {
          pickup: "https://example.com/sounds/potion_pickup.mp3",
          drop: "https://example.com/sounds/potion_drop.mp3",
        },
      },
      {
        name: "Dagger",
        size: { width: 1, height: 2 },
        imageUrl: "/api/placeholder/40/80",
        rarity: "uncommon",
        properties: [
          { name: "Damage", value: "1d4 piercing" },
          { name: "Property", value: "+1 to hit" },
          { name: "Weight", value: "1 lb" },
        ],
        sounds: {
          pickup: "https://example.com/sounds/dagger_pickup.mp3",
          drop: "https://example.com/sounds/dagger_drop.mp3",
        },
      },
      {
        name: "Helmet",
        size: { width: 2, height: 2 },
        imageUrl: "/api/placeholder/80/80",
        rarity: "rare",
        properties: [
          { name: "AC Bonus", value: "+1" },
          { name: "Property", value: "Advantage on Perception" },
          { name: "Weight", value: "4 lb" },
        ],
        sounds: {
          pickup: "https://example.com/sounds/helmet_pickup.mp3",
          drop: "https://example.com/sounds/helmet_drop.mp3",
        },
      },
      {
        name: "Staff",
        size: { width: 1, height: 4 },
        imageUrl: "/api/placeholder/40/160",
        rarity: "epic",
        properties: [
          { name: "Damage", value: "1d6 bludgeoning" },
          { name: "Magic", value: "+2 to spell attack rolls" },
          { name: "Property", value: "Can cast Magic Missile 1/day" },
          { name: "Weight", value: "4 lb" },
        ],
        sounds: {
          pickup: "https://example.com/sounds/staff_pickup.mp3",
          drop: "https://example.com/sounds/staff_drop.mp3",
        },
      },
    ];

    const randomType = itemTypes[Math.floor(Math.random() * itemTypes.length)];

    // Find a valid position
    let validPosition: Position | null = null;
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const testItem: Item = {
          id: "temp",
          name: randomType.name,
          position: { x, y },
          size: randomType.size,
          imageUrl: randomType.imageUrl,
          properties: [],
        };

        if (isValidPosition(testItem, { x, y })) {
          validPosition = { x, y };
          break;
        }
      }
      if (validPosition) break;
    }

    if (validPosition) {
      const newItem: Item = {
        id: Date.now().toString(),
        name: randomType.name,
        position: validPosition,
        size: randomType.size,
        imageUrl: randomType.imageUrl,
        rarity: randomType.rarity as any,
        properties: randomType.properties,
        sounds: randomType.sounds,
      };

      setItems([...items, newItem]);

      // Play drop sound for new item
      playSound(randomType.sounds?.drop);
    } else {
      alert("No space left in inventory!");
    }
  };

  // Render grid cells
  const renderGrid = () => {
    const cells = [];
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        cells.push(
          <div
            key={`cell-${x}-${y}`}
            className="border border-gray-600 bg-opacity-20 bg-gray-800"
            style={{
              position: "absolute",
              left: `${x * CELL_SIZE}px`,
              top: `${y * CELL_SIZE}px`,
              width: `${CELL_SIZE}px`,
              height: `${CELL_SIZE}px`,
            }}
          />
        );
      }
    }
    return cells;
  };

  // Render each item in the inventory
  const renderItems = () => {
    return items.map((item) => {
      // Skip rendering the currently dragged item in the normal grid
      // It will be rendered separately at the fixed position
      if (draggedItem && item.id === draggedItem.id) {
        return null;
      }

      // For tooltip positioning
      const itemPos = {
        x: item.position.x * CELL_SIZE,
        y: item.position.y * CELL_SIZE,
      };

      // Normal item rendering
      const style: React.CSSProperties = {
        position: "absolute",
        width: `${item.size.width * CELL_SIZE}px`,
        height: `${item.size.height * CELL_SIZE}px`,
        left: `${item.position.x * CELL_SIZE}px`,
        top: `${item.position.y * CELL_SIZE}px`,
        backgroundImage: `url(${item.imageUrl})`,
        backgroundSize: "cover",
        border: `2px solid ${getRarityColor(item.rarity)}`,
        cursor: "grab",
        zIndex: 1,
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
      };

      return (
        <div
          key={item.id}
          className="item-wrapper"
          style={{ position: "relative" }}
        >
          <div
            style={style}
            onMouseDown={(e) => handleMouseDown(e, item)}
            onMouseEnter={(e) => handleMouseOver(e, item)}
            onMouseLeave={(e) => handleMouseOut(e)}
            onMouseMove={handleTooltipMouseMove}
            data-item-id={item.id}
          />
          {/* Only show tooltip if item is hovered AND not being dragged */}
          {hoveredItem && hoveredItem.id === item.id && !draggedItem && (
            <ItemTooltip item={item} position={itemPos} />
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-amber-300">
        D&D Inventory System
      </h1>

      <div className="mb-4 flex space-x-4">
        <button
          onClick={addRandomItem}
          className="px-4 py-2 bg-amber-700 hover:bg-amber-600 rounded text-white"
        >
          Add Random Item
        </button>

        <button
          onClick={() => {
            if (confirm("Reset inventory to defaults?")) {
              setItems(defaultItems);
            }
          }}
          className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded text-white"
        >
          Reset Inventory
        </button>
      </div>

      <div
        id="inventory-container"
        className="relative border-4 border-amber-900 rounded p-2 bg-cover bg-center shadow-lg"
        style={{
          width: `${GRID_WIDTH * CELL_SIZE + 20}px`,
          height: `${GRID_HEIGHT * CELL_SIZE + 20}px`,
          backgroundImage: "url('/api/placeholder/440/440')",
          backgroundSize: "cover",
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={(e) => {
          // Don't trigger mouseup when just leaving the container
          // We'll handle deletion only when the mouse is released
        }}
      >
        <div
          id="inventory-grid"
          className="relative"
          style={{
            width: `${GRID_WIDTH * CELL_SIZE}px`,
            height: `${GRID_HEIGHT * CELL_SIZE}px`,
          }}
        >
          {renderGrid()}
          {renderItems()}
        </div>
      </div>

      {/* Render dragged item separately so it can move outside the grid */}
      {draggedItem && (
        <div
          style={{
            position: "fixed",
            width: `${draggedItem.size.width * CELL_SIZE}px`,
            height: `${draggedItem.size.height * CELL_SIZE}px`,
            left: `${mousePosition.x - dragOffset.x}px`,
            top: `${mousePosition.y - dragOffset.y}px`,
            backgroundImage: `url(${draggedItem.imageUrl})`,
            backgroundSize: "cover",
            border: `2px solid ${getRarityColor(draggedItem.rarity)}`,
            zIndex: 100,
            cursor: "grabbing",
            opacity: 0.8,
            pointerEvents: "none",
          }}
        />
      )}

      <div className="mt-4 text-amber-300 text-center max-w-md">
        <p>
          Click and drag items to move them around. Items snap to the grid and
          cannot overlap.
        </p>
        <p className="mt-2">Hover over items to see their properties.</p>
        <p className="mt-2">
          Drag items outside the inventory and release to delete them.
        </p>
        <p className="mt-2 text-green-300">
          Your inventory is automatically saved between sessions.
        </p>
      </div>
    </div>
  );
};

export default DiabloInventory;
