/// <reference path="strext.ts" />
/// <reference path="errors.ts" />

interface Number {
    toString(format: string | number): string;
}

interface NumberConstructor {
    TryParseInt(value: string, out: DotnetJs.OutParam<number>);
}

(function () {
    let char = DotnetJs.Char;
    let toString = Number.prototype.toString;
    Number.TryParseInt = TryParseInt;
    Number.prototype.toString = function (format: string | number): string {
        if (format == null || typeof format == 'number' || TryParseInt(<string>format, out => format = out))
            return toString.apply(this, [format]);
        if (format.length == 0)
            throw new DotnetJs.FormatException('format = ' + format);
        let sign = <number>this.valueOf() < 0 ? '-' : '';
        let value = Math.abs(this.valueOf());
        let fd = tryGetParam(format);

        if (format.StartsWith('D', true)) {
            return Decimal(sign, value, fd);
        }

        if (format.StartsWith('E', true)) {
            let e = format[0];
            return Exponential(sign, value, fd, char.IsLower(e));
        }

        if (format.StartsWith('F', true)) {
            return FixedPoint(sign, value, fd);
        }

        if (format.StartsWith('G', true)) {
            let func: (sign: string, value: number, digits?: number, lowerCase?: boolean) => string;
            if (value == Math.floor(value))
                func = Decimal;
            else if (value < 1e-6 || value > 1e+14)
                func = Exponential;
            else func = FixedPoint;
            return func(sign, value, fd, char.IsLower(format, 0));
        }

        if (format.StartsWith('N', true)) {
            return Numeric(sign, value, fd);
        }

        if (format.StartsWith('P', true)) {
            return Percentage(sign, value, fd);
        }

        if (format.StartsWith('X', true)) {
            return Hexadecimal(sign, value, fd, format[0] == 'x');
        }

        throw new DotnetJs.FormatException('format = ' + format);
    }

    function Decimal(sign: string, value: number, digits?: number): string {
        digits = digits || 0;
        let base = <string>toString.apply(value, []);
        if (base.indexOf('.') != -1)
            throw new DotnetJs.FormatException(base + 'is not a decimal');
        return sign + base.PadLeft(digits, '0');
    }

    function Exponential(sign: string, value: number, digits?: number, lowerCase?: boolean): string {
        let expChar = lowerCase ? 'e' : 'E';
        let exp = digits == null ? value.toExponential() : value.toExponential(digits);
        let ei = exp.indexOf('e');
        let pw = exp.substring(ei + 2);
        return sign + exp.substring(0, ei) + expChar + exp[ei + 1] + pw.PadLeft(3, '0');
    }

    function FixedPoint(sign: string, value: number, digits?: number): string {
        digits = digits || 2;
        let result = "";
        while (value >= 1e21) {
            let sub = value % 1e20;
            result += toString.apply((value - sub) * 1e-20, []);
            value = sub;
        }
        result += value.toFixed(digits);
        return sign + result;
    }

    function Numeric(sign: string, value: number, digits?: number): string {
        let pre = FixedPoint('', value, digits);
        let pi = pre.indexOf('.');
        let rtn = sign;
        if (pi == -1)
            pi = pre.length;
        for (let i = 0; i < pre.length; i++) {
            if (i != 0 && i <= pi - 3 && (pi - i) % 3 == 0)
                rtn += ','
            rtn += pre[i];
        }
        return rtn;
    }

    function Percentage(sign: string, value: number, digits?: number): string {
        let pre = Numeric(sign, value * 100, digits);
        return pre + ' %';
    }

    function Hexadecimal(sign: string, value: number, digits?: number, lowerCase?: boolean): string {
        digits = digits || 0;
        let pre = <string>toString.apply(value, [16]);
        if (!lowerCase)
            pre = pre.toUpperCase();
        return sign + pre.PadLeft(digits, '0');
    }

    function tryGetParam(format: string): number {
        if (format.length > 1) {
            let fd = Number(format.substring(1));
            if (isNaN(fd))
                throw new DotnetJs.FormatException('format = ' + format);
            return fd;
        }
        return null;
    }

    function TryParseInt(value: string, out: DotnetJs.OutParam<number>): boolean {
        let num = Number(value);
        if (isNaN(num))
            return false;
        out(num);
        return true;
    }
})();