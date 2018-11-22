class Register {

    constructor (value) {
        this.state = false; // false: 未占用, true: 占用
        this.manipulation = "";//占用该寄存器的功能部件名称
        this.read = 0; // 作为指令的源寄存器，指令的加载时间。0表示已读取操作数，解除占用
        this.value = value?value.toFixed(1):0;//寄存器的内容
    }

    clear () {
        this.state = false;
        this.manipulation = "";
    }

}