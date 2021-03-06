// @flow

import exceptions from './exceptions'
import Queue from './queue'
import Store from './index'
import SetDictionary from './setdictionary'
import Computed from './computed'

export function formatObjectQuery(props:ObjectType<prop> | Array<prop>) {
	/*

	  Formats array of object props into object with 
		  {
			[String aliasKey]: String actualKey
		  }
	  if props is already an object, it leaves it alone.

	*/

	// Validates that first argument is either an object or an array
	exceptions.validateObjectQuery(props)

	let formatted;
	if (Array.isArray(props)) {
		formatted = {}
		props.forEach(a => {
			formatted[a] = a
		})
	} else {
		formatted = props;
	}
	return formatted;
}

/**
 * Returns an object of getters;
 * 
 * @export
 * @param {Object} obj 
 * @param {Object} propDictionary 
 * @returns 
 */
export function formatObjectPieceForComponent(obj:Object, propDictionary:Object) {
	/*
	  Loops through keys in formatted props passed to `openState`
	  and uses their values, the actual `state` properties,
	  to return a chunk of state with custom keys.
	*/
	let piece = {}
	for (let name in propDictionary) {
		let prop = propDictionary[name]
		let value = obj[prop]
		piece[name] = value
	}
	return piece;
}

export function updateAllComputedInSet(computedSet:Set<Computed>){

	computedSet.forEach(
		c => c.update()
	)

}

/**
 * 
 * 
 * @param {Object} listener 
 * @param {Object} state 
 * @param {Queue} queue 
 * @returns {Object} 
 * 
 * 
 */


export function clearObject(obj:Object){
	for (let prop in obj) {
		delete obj[prop]
	}
}


export function moduleFromQuery(moduleQuery:string, store:Store){

	/*
		takes in module query in the form of "mymodule.nestedmodule.deeplynestedmodule"
		and responds with the module.
	*/

	let module = store;
	let moduleNames = moduleQuery.split('.')

	/*
	 if there is no module query, module is always the root store
	*/
	let i = 0;
	while(!!moduleQuery.length && i<moduleNames.length){
		let name = moduleNames[i]
		module = module._modules[name]
		if(!module) throw new Error(`Hivex Store module with name "${name}" could not be found!`)
		i++;
	}

	return module;

}

type getModuleStateParams = {
	moduleQuery:string,
	stateQuery:Object,
	component:Object,
}

function getModuleState({
	moduleQuery="",
	stateQuery,
	component,
}:getModuleStateParams, store:Store){
	let module = moduleFromQuery(moduleQuery, store);
	let formattedQuery = formatObjectQuery(stateQuery);
}

export function parseOpenArgs(args:openArgs) : Array<any> {
		/*
			- The purpose of this function is to
				take in an array of arguments passed to 
				an open function ( `openState`, `openActions`, etc.)
				and return an array of three items depicting
				the requested module, the query, and the component
				respectively.
		*/
		let module, query, component;

		// if module is root module, first argument can be query.
		if(typeof args[0] == "string"){

			[module, query, component] = args;

		}else{

			// defaults to blank module query (root store)
			[module, query, component] = ["", ...args]

		}
		return [
			module, 
			query, 
			component
		]
}

export function objectForEach(obj:Object, cb:(...any:any)=>any){
	for(let prop in obj){
		let val = obj[prop]
		cb(val, prop)
	}
}

export function hasAProperty(obj:Object) : boolean {
	let result : boolean = false;
	for(let prop in obj){
		result = true;
		break;
	}
	return result;
}
/*

	Flow bug fix for Object#getOwnPropertyDescriptors

*/

export function getOwnPropertyDescriptors(obj:Object) : { [prop]:Object } {
	let descriptors = {}
	for(let prop in obj){
		descriptors[prop] = Object.getOwnPropertyDescriptor(obj)
	}
	return descriptors;
}

export function clearDescriptor(obj:Object, prop:prop){
		let value = obj[prop];
		let {
			enumerable,
		} = Object.getOwnPropertyDescriptor(obj, prop);

		let descriptor = {
			value,
			writeable:true,
			enumerable,
			configurable:true,
		}

		Object.defineProperty(obj, prop, descriptor);
}

export function clearDescriptors(obj:Object, properties:Array<prop>){
	let descriptors = {}
	let originalDescriptors = getOwnPropertyDescriptors(obj);
	let length = properties.length;
	properties.forEach(
		prop=>{
			let value = obj[prop];
			let {
				writeable,
				enumerable,
			} = originalDescriptors[prop];

			descriptors[prop] = {
				value,
				writeable,
				enumerable,
				configurable:true,
			}
		}
	)

	Object.defineProperties(obj, descriptors);

}

export function getterProxy(obj:Object, getter:anycb, destination ?: Object = {}) : Object {
	let descriptors = {}
	let properties = Object.getOwnPropertyNames(obj) || [];
	let length = properties.length;
	properties.forEach(
		prop=>{

			descriptors[prop] = {
				configurable:false,
				get(){
					return getter(obj, prop)
				}
			}

		}
	)

	Object.defineProperties(destination, descriptors);
	return destination;
}



















