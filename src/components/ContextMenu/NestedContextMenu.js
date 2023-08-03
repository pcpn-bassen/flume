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
      (grouped[option.group] = grouped[option.group] || []).push(option);
      return grouped;
    }, {});
  }, [options]);

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
              placeholder="Search Nodes..."
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
      ...Object.entries(groupedOptions).filter((groupedOption) => groupedOption.group != null ).map(([group, options], groupIndex) => (
        <SubContextOption
        menuId={group}
        index={groupIndex} 
        onMouseEnter={() => handleGroupMouseEnter(options, groupIndex)}
        onMouseLeave={handleGroupMouseLeave}
        ref={ref => optionRefs.current[groupIndex] = ref}
        key={group}
        > 
            <div className="subContextOption">
              <label>{group}</label>
              <svg xmlns="http://www.w3.org/2000/svg"  stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </div>
          </SubContextOption>
        )),
        ...Object.entries(groupedOptions).filter((groupedOption) => groupedOption.group == null ).map((option) => (
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
        )) ]
      :
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
      data-flume-component="ctx-menu-option"
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
        {option.description ? <p>{option.description}</p> : null}
      </ContextOption>
    ))}
  </div>
);


export default NestedContextMenu;
