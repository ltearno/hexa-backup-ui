let work = () => {
    a = b + 2
}

function sandboxed() {
    console.log('hi from sandbox')
    function plus(a, b) {
        return a + b
    }

    c = plus(a, b)
    c = a
}

function sandbox() {
    const sandboxProxy = new Proxy({}, {
        has: () => true,
        get: (target, key) => {
            if (typeof key === 'symbol')
                return {}
            console.log(`read ${key}`)
            if (key == sandboxed.name)
                return sandboxed
            return {}
        },
        set: (target, key, value) => {
            if (typeof key === 'symbol')
                return
            console.log(`write ${key} to ${value}`)
        }
    })

    with (sandboxProxy) {
        sandboxed()
    }
}

sandbox()

/*

try {
    code = 'with (sandbox) { return (' + code + ') }'
    const codeFunction = new Function('sandbox', code)

    liveInstance = function (sandbox) {
        const sandboxProxy = new Proxy(sandbox, {
            has: () => true,
            get: (target, key) => {
                if (key === Symbol.unscopables)
                    return undefined
                return target[key]
            }
        })

        return codeFunction(sandboxProxy)
    }(instanceSandbox)

    return liveInstance
}
catch (error) {
    console.error(`cannot create live instance of smart contract, probably because of Javascript error\n${error}`)
    return null
}

*/