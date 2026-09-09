/**
 * Responsive Navigation Script
 * Dynamically hides navigation items that don't fit on screen in the main nav
 * and shows them in the hamburger menu instead. Uses ResizeObserver to monitor
 * the nav element and checks items from right to left to determine which ones
 * overflow. Items are matched between nav and hamburger menu using data-nav-item
 * attributes.
 */

const nav = document.querySelector("header nav");
const menu = nav.querySelector(".hamburger-menu");
const [menuButton, menuList] = menu.children;

// Map to track nav items and their hamburger menu counterparts
let itemMap = new Map();

// Get all nav items (excluding the hamburger menu and the ones that are supposed to be shown in the footer)
let navItems = [...nav.children].filter(
	child => !child.classList.contains("hamburger-menu") && !child.classList.contains("footer"),
);

let hamburgerMenuItems = [...menuList.children];
for (let navItem of navItems) {
	let index = navItem.dataset.navItem;
	let hamburgerItem = hamburgerMenuItems.find(item => item.dataset.navItem === index);
	if (hamburgerItem) {
		itemMap.set(navItem, hamburgerItem);
	}
}

const resizeObserver = new ResizeObserver(checkFit);
resizeObserver.observe(nav);

function checkFit () {
	// Reset: show all items in nav, hide all in hamburger
	itemMap.forEach((hamburgerItem, navItem) => {
		navItem.hidden = false;
		hamburgerItem.hidden = true;
	});

	// Temporarily show hamburger menu to measure its width
	menu.style.setProperty("display", "block");

	let hamburgerButtonWidth = menuButton.offsetWidth ?? 50;
	let navRect = nav.getBoundingClientRect();
	let navRight = navRect.right;
	let availableRight = navRight - hamburgerButtonWidth;

	let items = [...itemMap.keys()];
	let toHide = [];

	// Check each item from right to left to see which ones overflow
	// by comparing their right edge to available space
	for (let i = items.length - 1; i >= 0; i--) {
		const item = items[i];
		const itemRect = item.getBoundingClientRect();
		const itemRight = itemRect.right;
		// If this item's right edge exceeds available space, hide it
		if (itemRight > availableRight) {
			toHide.push(item);
		}
		else {
			// Once we find an item that fits, we can stop
			break;
		}
	}

	menu.style.removeProperty("display");

	// Hide items in nav and show corresponding items in hamburger menu
	for (let navItem of toHide) {
		let hamburgerItem = itemMap.get(navItem);

		navItem.hidden = true;
		hamburgerItem.hidden = false;
	}
}
