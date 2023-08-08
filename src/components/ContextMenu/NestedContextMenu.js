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

  const groupedOptions = React.useMemo(() => {
    return options.reduce((grouped, option) => {
      (grouped[option.group] = grouped[option.group] || []).push({
        ...option,
        isGrouped: !!option.group
      });
      return grouped;
    }, {});
  }, [options]);

  const groupIconsMap = new Map();

groupIconsMap.set('Data', <svg data-flume-component="ctx-submenu-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file"><path d="m3 18v-18h12v12l-4 4z"/><path d="m3 0 7 7m-7 4 7-7"/></svg>);
groupIconsMap.set('Input', <svg data-flume-component="ctx-submenu-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-text-cursor-input"><path d="M5 4h1a3 3 0 0 1 3 3 3 3 0 0 1 3-3h1"/><path d="M13 20h-1a3 3 0 0 1-3-3 3 3 0 0 1-3 3H5"/><path d="M5 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1"/><path d="M13 8h7a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-7"/><path d="M9 7v10"/></svg>);
groupIconsMap.set('Math', <svg data-flume-component="ctx-submenu-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calculator"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>);
groupIconsMap.set('Text', <svg data-flume-component="ctx-submenu-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-case-sensitive"><path d="m3 15 4-8 4 8"/><path d="M4 13h6"/><circle cx="18" cy="12" r="3"/><path d="M21 9v6"/></svg>)
groupIconsMap.set('Logic', <svg data-flume-component="ctx-submenu-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-binary"><rect x="14" y="14" width="4" height="6" rx="2"/><rect x="6" y="4" width="4" height="6" rx="2"/><path d="M6 20h4"/><path d="M14 10h4"/><path d="M6 14h2v6"/><path d="M14 4h2v6"/></svg>)


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
