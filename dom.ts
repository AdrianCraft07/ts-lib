export function dom(type:string, props:Object, ...args: (HTMLHeadingElement | string | number)[]): { type: string; props: Object; childrens: (HTMLHeadingElement | string | number)[];} {
	const childrens = args.length ? [].concat(...args) : [];
	return {
		type,
		props: props || {},
		childrens,
	};
}
//#region
function isEventProp(name) {
	return /^on/.test(name);
}
function extractEventName(name) {
	return name.slice(2).toLowerCase();
}
function setProp(node, name, value) {
	if (name === 'className') {
		name = 'class';
	}
	if (typeof value === 'boolean') {
		value = setBooleanProp(node, name, value);
	} else if (value instanceof Array) {
		value = value.join(' ');
	}
	node.setAttribute(name, value);
}
function setBooleanProp(node, name, value) {
	if (value) {
		node[name] = true;
	} else {
		node[name] = false;
	}
	return node[name];
}
function setAttributes(node, props = {}) {
	if (!props) {
		return;
	}
	Object.keys(props)
		.filter(prop => !isEventProp(prop))
		.forEach(name => setProp(node, name, props[name]));
}
function addEventListeners(node, props = {}) {
	if (!props) {
		return;
	}
	Object.keys(props)
		.filter(isEventProp)
		.forEach(event => node.addEventListener(extractEventName(event), props[event]));
}
//#endregion

/**
 * @param {string | number | object} node
 * @return {HTMLElement}
 */
export function createElement(node:string | number | object):HTMLElement {
	if(!node) return;
	if (typeof node === 'string' || typeof node === 'number') {
		return document.createTextNode(node);
	}
	if (node instanceof HTMLElement) return node;

	if (typeof node.type === 'function') {
		const nodeDom = node.type(node.props);
		nodeDom.childrens = node.childrens;
		return createElement(nodeDom);
	}

	const element = document.createElement(node.type);

	setAttributes(element, node.props);

	addEventListeners(element, node.props);

	node.childrens && node.childrens.map(createElement).forEach(child => child && element.appendChild(child));

	return element;
}

export function createElementDom(type:string, props:Object, ...args:(HTMLElement | string | number)[]) {
	return createElement(dom(type, props, ...args));
}
createElement.dom = createElementDom;
