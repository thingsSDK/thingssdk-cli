import {sayIt} from './utils';
import {sayIt as otherSayit} from './util2';
E.on(() => {
    const wifi = require('Wifi');
    sayIt("Hello!");
    otherSayit("Bye!");
});
