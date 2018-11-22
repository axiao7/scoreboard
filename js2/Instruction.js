//指令对象
// (function () {
    function Instruction(Op, dest, source_1, source_2) {
        this.Op = Op;//指令名称
        this.dest = dest;//目标寄存器
        this.source_1 = source_1;//源寄存器1
        this.source_2 = source_2;//源寄存器2
        this.state = 0; // 指令状态 0： 没有执行，1： 正在执行，2： 执行结束
        this.stage = ["", "", "", ""];//记录指令执行每个阶段的时钟周期，四个阶段分别是：指令流出、读操作数、执行、写回
        this.temp = 0;//计算指令结果的中间存储变量
    }
    Instruction.prototype = {
        constructor:Instruction,
        setIssue: function (clock) {//设置指令流出时间
            this.state = 1;
            this.stage[0] = clock + "";
        },
        setOperand: function (clock) {//设置读操作数时间
            this.stage[1] = clock + "";
        },
        setExec: function (clock) {//设置执行时间
            this.stage[2] = clock + "";
        },
        setWrite: function (clock) {//设置写回时间
            this.state = 2;
            this.stage[3] = clock + "";
        },
        issueTime: function () {//获取指令流出阶段时钟周期
            return Number(this.stage[0]);
        },
        getSource: function () {//获取当前指令的字符串形式
            return this.Op + " " + this.dest + " " + this.source_1 + " " + this.source_2;
        },
        isRunning: function () {//当前指令是否正在执行
            return this.state >= 1 ? true : false;
        },
        isFinished: function () {//当前指令是否执行结束
            return this.state == 2 ? true : false;
        }
    };
// window.Instruction=Instruction;

// }());