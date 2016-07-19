import api from './utils';

class Silly {
    aFunction() {
        api.sayIt("Looks like this");
        api.sayIt(api.hello("Craig"));
    }
}

let silly = new Silly();
silly.aFunction();