"use strict";

class Mock
{

    *test(next)
    {
        this.body = "hello";
        yield next;
    }

}

module.exports = Mock;