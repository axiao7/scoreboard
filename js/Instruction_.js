class Instruction {

    constructor (Op, dest, source_1, source_2) {
        this.Op = Op;//指令名称
        this.dest = dest;//目标寄存器
        this.source_1 = source_1;//源寄存器1
        this.source_2 = source_2;//源寄存器2
        this.state = 0; // 指令状态 0： 没有执行，1： 正在执行，2： 执行结束
        this.stage = ["", "", "", ""];//记录指令执行每个阶段的时钟周期，四个阶段分别是：指令流出、读操作数、执行、写回
        this.temp = 0;//计算指令结果的中间存储变量
    }

    //设置指令流出时间
    setIssue (clock) {
        this.state = 1;
        this.stage[0] = clock + "";
    }

    //设置读操作数时间
    setOperand (clock) {
        this.stage[1] = clock + "";
    }

    //设置执行时间
    setExec (clock) {
        this.stage[2] = clock + "";
    }

    //设置写回时间
    setWrite (clock) {
        this.state = 2;
        this.stage[3] = clock + "";
    }

    //发射时间
    issueTime () {
        return Number(this.stage[0]);
    }

    //获取当前指令的字符串形式
    getSource () {
        return this.Op + " " + this.dest + " " + this.source_1 + " " + this.source_2;
    }

    //当前指令是否正在执行
    isRunning () {
        return this.state >= 1 ? true : false;
    }

    //当前指令是否执行结束
    isFinished () {
        return this.state == 2 ? true : false;
    }
    insSetdata(tep){
        this.Op = tep.Op;//指令名称
        this.dest = tep.dest;//目标寄存器
        this.source_1 = tep.source_1;//源寄存器1
        this.source_2 = tep.source_2;//源寄存器2
        this.state = tep.state; // 指令状态 0： 没有执行，1： 正在执行，2： 执行结束
        this.stage = tep.stage;//记录指令执行每个阶段的时钟周期，四个阶段分别是：指令流出、读操作数、执行、写回
        this.temp = tep.temp;//计算指令结果的中间存储变量
        // console.log( this.Op+""+this.stage);
    }




}