
const EVENT_LAYOUT_READY = 'layout_ready';

const callbackMap = {
    [EVENT_LAYOUT_READY]: {}
};

function observe(event, callbackId, callbackFn) {
    callbackMap[event][callbackId] = callbackFn;
}

function dispatch(event, data) {
    for (let callbackId in callbackMap[event]) {
        if (callbackMap[event].hasOwnProperty(callbackId)) {
            callbackMap[event][callbackId](data);
        }
    }
}

export default {
    observe,
    dispatch
}

export {
    EVENT_LAYOUT_READY
}
