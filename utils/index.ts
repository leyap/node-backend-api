class Utils {

    static buildCSVFromArray(array: [any: any]) {
        let result = "data:text/csv;charset=utf-8,";
        const data = [];
        if (array.length) {
            const keys = Object.keys(array[0]);
            result += keys.join(",") + "\n";
            for (let i = 0; i < array.length; i++) {
                const item = array[i];
                const row = keys.map((k) => {
                    let col: any = item[k];
                    if (col && typeof col === "string") {
                        col = col.replace(/"/, '""');
                        return '"' + col + '"';
                    } else {
                        return col;
                    }
                });
                data.push(row.join(","));
            }
        }
        return result + data.join("\n");
    }

    static buildCSV(obj: any) {
        const {cols, rows} = obj;
        const result = "data:text/csv;charset=utf-8,";
        let data = [];
        data.push(cols);
        data = data.concat(rows);
        data = data.map((row) => {
            return row.map((item: any) => {
                if (typeof item === "string") {
                    item = item.replace(/"/g, '""');
                    return `"${item}"`;
                } else {
                    return item;
                }
            });
        });
        return result + data.join("\n");
    }

    static objToBase64(obj: any) {
        const {cols, rows} = obj;
        const result = "data:text/json;charset=utf-8,";
        return result + JSON.stringify({cols, rows}, null, "  ");
    }

    static fillZero(numStr: string, len: number) {
        const zeroL = len - numStr.length;
        let r = numStr;
        for (let i = 0; i < zeroL; i++) {
            r = "0" + r;
        }
        return r;
    }

    static base64toFile(dataurl, filename = 'file') {
        //将base64格式分割：['data:image/png;base64','XXXX']
        const arr = dataurl.split(',')
        // .*？ 表示匹配任意字符到下一个符合条件的字符 刚好匹配到：
        // image/png
        const mime = arr[0].match(/:(.*?);/)[1]  //image/png
        //[image,png] 获取图片类型后缀
        const suffix = mime.split('/')[1] //png
        const bstr = atob(arr[1])   //atob() 方法用于解码使用 base-64 编码的字符串
        let n = bstr.length
        const u8arr = new Uint8Array(n)
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n)
        }
        return new File([u8arr], `${filename}.${suffix}`, {
            type: mime
        })
    }

    static checkUser(str: string) {
        return /^[a-zA-z]\w{3,15}$/.test(str);
    }

    static checkMobile(str: string) {
        return /^1\d{10}$/.test(str);
    }

    static checkPhone(str: string) {
        return /^0\d{2,3}-?\d{7,8}$/.test(str);
    }

    static checkEmail(str: string) {
        return /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/.test(str);
    }

    static isValidEmail(str: string) {
        return /^\w+((.\w+)|(-\w+))@[A-Za-z0-9]+((.|-)[A-Za-z0-9]+).[A-Za-z0-9]+$/.test(
            str
        );
    }

}

export default Utils;
