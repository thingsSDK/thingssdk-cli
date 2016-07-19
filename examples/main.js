import api from './utils';

class Silly {
    aFunction() {
        console.log("Looks like this");
        api.hello("Craig");
    }
}

let silly = new Silly();
silly.aFunction();