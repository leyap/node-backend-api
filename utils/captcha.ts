import GdGif from 'gd-gif'

function getCaptchaImageGif() {
    let g = new GdGif(100, 34);
    let capCode = "";
    for (let i = 0; i < 4; i++) {
        capCode += g.rand(0, 9);
    }
    g.setVerificationCode(capCode);
    return {capCode, data: g.getImage()}; //binary
}

function getCaptchaImage() {
    let g = new GdGif(200, 68);
    let capCode = "";
    for (let i = 0; i < 4; i++) {
        capCode += g.rand(0, 9);
    }
    g.pushColor("0055FF");
    g.pushColor("0066CC");
    g.pushColor("ff2100");
    g.pushColor("00a23d");
    g.addFrames(30);//添加一帧，等待0.3秒，如果只添加一帧，则没有动画效果
    g.drawText(capCode[0], 3, 3, "0055FF");//在坐标3，3的位置写入字符0
    // g.addFrames(30);//不想要动画，注销该行
    g.drawText(capCode[1], 23, 3, "0066CC");
    // g.addFrames(30);//不想要动画，注销该行
    g.drawText(capCode[2], 43, 5, "ff2100");
    // g.addFrames(30);//不想要动画，注销该行
    g.drawText(capCode[3], 63, 5, "00a23d");
    return {capCode, data: g.getImage()}; //binary
}

export {getCaptchaImage, getCaptchaImageGif}
