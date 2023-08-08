import React from "react";
import styles from "./ContextMenu.css";
import clamp from "lodash/clamp";
import { nanoid }from "nanoid/non-secure/index";

const NestedContextMenu = ({
  x,
  y,
  options = [],
  onRequestClose,
  onOptionSelected,
  label,
  hideHeader,
  hideFilter,
  emptyText
}) => {
  const menuWrapper = React.useRef();
  const menuOptionsWrapper = React.useRef();
  const filterInput = React.useRef();
  const [filter, setFilter] = React.useState("");
  const [menuWidth, setMenuWidth] = React.useState(0);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [hoveredGroup, setHoveredGroup] = React.useState(null);
  const [subMenuPosition, setSubMenuPosition] = React.useState(null);
  const [subMenuOptions, setSubMenuOptions] = React.useState(null);
  const menuId = React.useRef(nanoid(10));
  const optionRefs = React.useRef({});

  const handleOptionSelected = option => {
    onOptionSelected(option);
    onRequestClose();
  };

  const testClickOutside = React.useCallback(
    e => {
      if (menuWrapper.current && !menuWrapper.current.contains(e.target)) {
        onRequestClose();
        document.removeEventListener("click", testClickOutside, { capture: true });
        document.removeEventListener("contextmenu", testClickOutside, { capture: true });
      }
    },
    [menuWrapper, onRequestClose]
  );

  const testEscape = React.useCallback(
    e => {
      if (e.keyCode === 27) {
        onRequestClose();
        document.removeEventListener("keydown", testEscape, { capture: true });
      }
    },
    [onRequestClose]
  );

  React.useEffect(() => {
    if (filterInput.current) {
      filterInput.current.focus();
    }
    setMenuWidth(menuWrapper.current.getBoundingClientRect().width);
    document.addEventListener("keydown", testEscape, { capture: true });
    document.addEventListener("click", testClickOutside, { capture: true });
    document.addEventListener("contextmenu", testClickOutside, { capture: true });
    return () => {
      document.removeEventListener("click", testClickOutside, { capture: true });
      document.removeEventListener("contextmenu", testClickOutside, { capture: true });
      document.removeEventListener("keydown", testEscape, { capture: true });
    };
  }, [testClickOutside, testEscape]);

  const filteredOptions = React.useMemo(() => {
    if (!filter) return options;
    const lowerFilter = filter.toLowerCase();
    return options.filter(opt => opt.label.toLowerCase().includes(lowerFilter));
  }, [filter, options]);

  const handleFilterChange = e => {
    const value = e.target.value;
    setFilter(value);
    setSelectedIndex(0);
  };

  const handleKeyDown = e => {
    // Up pressed
    if (e.which === 38) {
      e.preventDefault();
      if (selectedIndex === null) {
        setSelectedIndex(0);
      } else if (selectedIndex > 0) {
        setSelectedIndex(i => i - 1);
      }
    }
    // Down pressed
    if (e.which === 40) {
      e.preventDefault();
      if (selectedIndex === null) {
        setSelectedIndex(0);
      } else if (selectedIndex < filteredOptions.length - 1) {
        setSelectedIndex(i => i + 1);
      }
    }
    // Enter pressed
    if (e.which === 13 && selectedIndex !== null) {
      const option = filteredOptions[selectedIndex];
      if (option) {
        handleOptionSelected(option);
      }
    }
  };

  React.useEffect(() => {
    if (hideFilter || hideHeader) {
      menuWrapper.current.focus();
    }
  }, [hideFilter, hideHeader]);

  React.useEffect(() => {
    const menuOption = document.getElementById(
      `${menuId.current}-${selectedIndex}`
    );
    if (menuOption) {
      const menuRect = menuOptionsWrapper.current.getBoundingClientRect();
      const optionRect = menuOption.getBoundingClientRect();
      if (
        optionRect.y + optionRect.height > menuRect.y + menuRect.height ||
        optionRect.y < menuRect.y
      ) {
        menuOption.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  const handleGroupMouseEnter = (groupOptions, index) => {
    const rect = optionRefs.current[index].getBoundingClientRect();
    setSubMenuOptions(groupOptions);
    const xSubMenu = rect.right - x;
    const ySubMenu = rect.top - y;
    setSubMenuPosition({ x: xSubMenu, y: ySubMenu });
  }; 
  

  const handleGroupMouseLeave = () => {
    setSubMenuOptions(null);
    setSubMenuPosition(null);
  };

  const groupOrder = ['Data', 'Input', 'Math', 'Text', 'Logic', 'Time', 'Location', 'Color', 'Vector', 'Conversion', 'Utility'];

  const groupedOptions = React.useMemo(() => {
    const unorderedGrouped = options.reduce((grouped, option) => {
      (grouped[option.group] = grouped[option.group] || []).push({
        ...option,
        isGrouped: !!option.group
      });
      return grouped;
    }, {});

    const orderedGrouped = {};
    groupOrder.forEach(group => {
      if (unorderedGrouped[group]) {
        orderedGrouped[group] = unorderedGrouped[group];
      }
    });
    return orderedGrouped;
  }, [options]);

  const groupIconsMap = new Map();

groupIconsMap.set('Data', <svg data-flume-component="ctx-submenu-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hard-drive"><line x1="22" x2="2" y1="12" y2="12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" x2="6.01" y1="16" y2="16"/><line x1="10" x2="10.01" y1="16" y2="16"/></svg>);
groupIconsMap.set('Input', <svg data-flume-component="ctx-submenu-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-text-cursor-input"><path d="M5 4h1a3 3 0 0 1 3 3 3 3 0 0 1 3-3h1"/><path d="M13 20h-1a3 3 0 0 1-3-3 3 3 0 0 1-3 3H5"/><path d="M5 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1"/><path d="M13 8h7a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-7"/><path d="M9 7v10"/></svg>);
groupIconsMap.set('Math', <svg data-flume-component="ctx-submenu-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calculator"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>);
groupIconsMap.set('Text', <svg data-flume-component="ctx-submenu-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-whole-word"><circle cx="7" cy="12" r="3"/><path d="M10 9v6"/><circle cx="17" cy="12" r="3"/><path d="M14 7v8"/><path d="M22 17v1c0 .5-.5 1-1 1H3c-.5 0-1-.5-1-1v-1"/></svg>)
groupIconsMap.set('Logic', <svg data-flume-component="ctx-submenu-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-binary"><rect x="14" y="14" width="4" height="6" rx="2"/><rect x="6" y="4" width="4" height="6" rx="2"/><path d="M6 20h4"/><path d="M14 10h4"/><path d="M6 14h2v6"/><path d="M14 4h2v6"/></svg>)
groupIconsMap.set('Color', <svg data-flume-component="ctx-submenu-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-palette"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>);
groupIconsMap.set('Time', <svg data-flume-component="ctx-submenu-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);
groupIconsMap.set('Location', <svg data-flume-component="ctx-submenu-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>);
groupIconsMap.set('Vector', <svg data-flume-component="ctx-submenu-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-move-3d"><path d="M5 3v16h16"/><path d="m5 19 6-6"/><path d="m2 6 3-3 3 3"/><path d="m18 16 3 3-3 3"/></svg>);
groupIconsMap.set('Conversion', <svg data-flume-component="ctx-submenu-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right-left"><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>);
groupIconsMap.set('Utility', <svg data-flume-component="ctx-submenu-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pocket-knife"><path d="M3 2v1c0 1 2 1 2 2S3 6 3 7s2 1 2 2-2 1-2 2 2 1 2 2"/><path d="M18 6h.01"/><path d="M6 18h.01"/><path d="M20.83 8.83a4 4 0 0 0-5.66-5.66l-12 12a4 4 0 1 0 5.66 5.66Z"/><path d="M18 11.66V22a4 4 0 0 0 4-4V6"/></svg>);

  return (
    <div
      data-flume-component="ctx-menu"
      className={styles.menuWrapper}
      onMouseDown={e => e.stopPropagation()}
      onKeyDown={handleKeyDown}
      style={{
        left: x,
        top: y,
        width: filter ? menuWidth : "auto"
      }}
      ref={menuWrapper}
      tabIndex={0}
      role="menu"
      aria-activedescendant={`${menuId.current}-${selectedIndex}`}
    >
      {!hideHeader && (label ? true : !!options.length) ? (
        <div className={styles.menuHeader} data-flume-component="ctx-menu-header">
          <label className={styles.menuLabel} data-flume-component="ctx-menu-title">{label}</label>
          {!hideFilter && options.length ? (
            <input
              data-flume-component="ctx-menu-input"
              type="text"
              placeholder="Search..."
              value={filter}
              onChange={handleFilterChange}
              className={styles.menuFilter}
              autoFocus
              ref={filterInput}
            />
          ) : null}
        </div>
      ) : null}
      <div
        data-flume-component="ctx-menu-list"
        className={styles.optionsWrapper}
        role="menu"
        ref={menuOptionsWrapper}
        style={{ maxHeight: clamp(window.innerHeight - y - 70, 10, 300) }}
      >
        {!filter && (options.length > 0) ? [
  ...Object.entries(groupedOptions)
  .filter(([group, options]) => options[0].isGrouped)
  .map(([group, options], groupIndex) => (
    <SubContextOption
      menuId={group}
      index={groupIndex}
      onMouseEnter={() => handleGroupMouseEnter(options, groupIndex)}
      onMouseLeave={handleGroupMouseLeave}
      ref={(ref) => (optionRefs.current[groupIndex] = ref)}
      key={group}
    >
      {groupIconsMap.get(group)}
        <label>{group}</label>
        <svg data-flume-component="ctx-submenu-chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>
    </SubContextOption>
  )),
  ...Object.entries(groupedOptions)
    .flatMap(([group, options]) => options.filter(option => !option.isGrouped)
    .map((option, index) => (
      <ContextOption
        menuId={menuId.current}
        index={0}
        onClick={() => handleOptionSelected(option)}
        onMouseEnter={() => setSelectedIndex(index)}
        key={option.value}
        selected={selectedIndex === index}
      >
        {option.icon ? option.icon : null}
        {option.label}
      </ContextOption>
    )))
] :
      filteredOptions.map((option, index) => (
          <ContextOption
            menuId={menuId.current}
            index={0}
            onClick={() => handleOptionSelected(option)}
            onMouseEnter={() => setSelectedIndex(index)}
            key={option.value}
            selected={selectedIndex === index}
          >
            {option.icon ? option.icon : null}
            {option.label}
          </ContextOption>
        ))
      }
      {!options.length ? (
          <span data-flume-component="ctx-menu-empty" className={styles.emptyText}>{emptyText}</span>
        ) : null}
      </div>
      {subMenuPosition && subMenuOptions && (
        <SubContextMenu
          x={subMenuPosition.x}
          y={subMenuPosition.y}
          options={subMenuOptions}
          onSelect={option => {
            handleOptionSelected(option);
            setSubMenuOptions(null);
            setSubMenuPosition(null);
          }}
        />
      )}
    </div>
  );
};

const ContextOption = ({
  menuId,
  index,
  children,
  onClick,
  selected,
  onMouseEnter
}) => {
  return (
    <div
      data-flume-component="ctx-menu-option"
      className={styles.option}
      role="menuitem"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      data-selected={selected}
      id={`${menuId}-${index}`}
    >
      {children}
    </div>
  );
};

const SubContextOption = React.forwardRef(({
  menuId,
  index,
  children,
  onClick,
  selected,
  onMouseEnter
}, ref) => {
  return (
    <div
      data-flume-component="ctx-submenu-option"
      className={styles.option}
      role="menuitem"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      data-selected={selected}
      id={`${menuId}-${index}`}
      ref={ref}
    >
      {children}
    </div>
  );
});


const SubContextMenu = ({ x, y, options, onSelect }) => (
  <div className={styles.menuWrapper} data-flume-component="ctx-submenu" style={{ position: 'absolute', top: y, left: x }}>
    {options.map((option, index) => (
      <ContextOption
        menuId={option.group}
        index={index}
        onClick={() => onSelect(option)}
        key={option.value + index}
      >
        <label>{option.label}</label>
        <div data-flume-component="ctx-description">{option.description ? <p>{option.description}</p> : null}</div>
      </ContextOption>
    ))}
  </div>
);


export default NestedContextMenu;
