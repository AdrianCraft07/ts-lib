type Query<This = Query> = {
	element: HTMLElement;
	css(property: string, value: string): This;
	css(property: { [key: string]: string }): This;
	on<K extends keyof HTMLElementEventMap>(
		event: K,
		callback: (event: HTMLElementEventMap[K]) => void
	): This;
	html: (data?: string) => string;
	text: (data?: string) => string;
	append: (data: string | HTMLElement) => This;
	prepend: (data: string | HTMLElement) => This;
	childrens: () => QueryList;
	parent: () => Query;
	getAttribute: (name: string) => string;
	setAttribute: (name: string, value: string) => This;
	removeAttribute: (name: string) => This;
	clone: (deep?: boolean) => Query;
	remove: () => This;
};
type QueryList = Query & {
	forEach(
		callback: (element: Query, index: number, array: QueryList) => void
	): QueryList;
	forEach(callback: (element: Query, index: number) => void): QueryList;
	forEach(callback: (element: Query) => void): QueryList;
	[key: number]: Query;
	[Symbol.iterator]: () => IterableIterator<Query>;
};
type QueryNode = HTMLElement | Node | ParentNode;

export function $(node: string | NodeList | QueryNode | null): QueryList {
	let elements = [];
	if (typeof node === 'string')
		elements.push(...document.querySelectorAll(node));
	if (node instanceof HTMLElement) elements.push(node);
	if (node instanceof NodeList) elements.push(...node);

	let query = new Proxy(elements.map($.ƒ), {
		get(target, property) {
			if (property == Symbol.iterator) return target[Symbol.iterator];
			if (Number(property) == Number(property)) target[property];
			if (property == 'forEach')
				return callback => {
					target.forEach(callback);
					return query;
				};
			if (property == 'element') return target[0];
			if (property == 'getAttribute')
				return name => target[0].getAttribute(name);
			return (...args) => {
				target.forEach(q => {
					q[property](...args);
				});
				return query;
			};
		},
	});

	return query;
}
$.ƒ = function (element: HTMLElement): Query {
	let query: Query;
	let _ = (fn, props) => {
		const FN = (...args) => fn(...args) || query;
		Object.assign(FN, props);
		return FN;
	};
	query = new Proxy(element, {
		get(target, property) {
			if (property == 'forEach') return;
			if (property == 'scroll')
				return {
					to: _((options, y) => {
						if (typeof options === 'number' && typeof y === 'number')
							target.scrollTo(options, y);
						else if (typeof options === 'object') target.scrollTo(options);
						return query['scroll'];
					}),
					top: _((position, behavior) => {
						target.scrollTo({ top: position, behavior });
						return query['scroll'];
					}),
					left: _((position, behavior) => {
						target.scrollTo({ left: position, behavior });
						return query['scroll'];
					}),
					height: _(() => {
						return target.scrollHeight;
					}),
					width: _(() => {
						return target.scrollWidth;
					}),
					bottom: _((position, behavior) => {
						target.scrollTo({ top: target.scrollHeight - position, behavior });
						return query['scroll'];
					}),
					right: _((position, behavior) => {
						target.scrollTo({ left: target.scrollWidth - position, behavior });
						return query['scroll'];
					}),
				};
			if (property == 'value')
				return _(
					value => {
						// @ts-ignore
						if (!target?.value) return;
						// @ts-ignore
						if (typeof value === 'string') target.value = value;
						// @ts-ignore
						else return target.value;
					},
					{
						push(value) {
							// @ts-ignore
							if (!target?.value) return;
							// @ts-ignore
							target.value += value;
							return query['value'];
						},
					}
				);
			if (property == 'element') {
				return target;
			}
			if (property == 'css') {
				return _((property, value) => {
					if (typeof property === 'string') target.style[property] = value;
					else if (typeof property === 'object')
						Object.entries(property).forEach(([property, value]) => {
							target.style[property] = value;
						});
				});
			}
			if (property == 'on') {
				return _((event, callback) => {
					target.addEventListener(event, callback);
				});
			}
			if (property == 'html') {
				return _(data => {
					target.innerHTML = data;
					return target.innerHTML;
				});
			}
			if (property == 'text') {
				return _(data => {
					target.innerText = data;
					return target.innerText;
				});
			}
			if (property == 'append') {
				return _(data => {
					target.append(data);
					return target;
				});
			}
			if (property == 'prepend') {
				return _(data => {
					target.prepend(data);
					return target;
				});
			}
			if (property == 'childrens') {
				return _(data => {
					return $(target.childNodes);
				});
			}
			if (property == 'parent') {
				return _(data => {
					return $(target.parentNode);
				});
			}
			if (property == 'getAttribute') {
				return _(name => {
					return target.getAttribute(name);
				});
			}
			if (property == 'removeAttribute') {
				return _(name => {
					target.removeAttribute(name);
					return target;
				});
			}
			if (property == 'setAttribute') {
				return _((name, value) => {
					target.setAttribute(name, value);
					return target;
				});
			}
			if (property == 'remove') {
				return _(() => {
					target.remove();
					return target;
				});
			}
			if (property == 'clone') {
				return _(v => {
					return $(target.cloneNode(v));
				});
			}
			return _(callback => {
				query.on(property, (...args) => {
					callback(query, ...args);
				});
			});
		},
	});
	return query;
};
