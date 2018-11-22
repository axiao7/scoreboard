//控制器对象
// (function () {
    function Controller(instructions) {
        this.init();
    }

    Controller.prototype = {
        constructor: Controller,
        init: function () {//初始化
            this.init2();
            this.registers = {//默认寄存器内容为编号
                "F0": new Register(0), "F1": new Register(1), "F2": new Register(2),
                "F3": new Register(3), "F4": new Register(4), "F5": new Register(5),
                "F6": new Register(6), "F7": new Register(7), "F8": new Register(8),
                "F9": new Register(9), "F10": new Register(10), "F11": new Register(11),
                "F9": new Register(9), "F10": new Register(10), "F11": new Register(11),
                "F12": new Register(12), "F13": new Register(13), "F14": new Register(14),
                "F15": new Register(15), "F16": new Register(16), "F17": new Register(17),
                "F18": new Register(18), "F19": new Register(19), "F20": new Register(20),
                "F21": new Register(21), "F22": new Register(22), "F23": new Register(23),
                "F24": new Register(24), "F25": new Register(25), "F26": new Register(26),
                "F27": new Register(27), "F28": new Register(28), "F29": new Register(29),
                "F30": new Register(30), "F31": new Register(31), "R0": new Register(0),
                "R1": new Register(1), "R2": new Register(2), "R3": new Register(3),
                "R4": new Register(4), "R5": new Register(5), "R6": new Register(6),
                "R7": new Register(7), "R8": new Register(8), "R9": new Register(9),
                "R10": new Register(10), "R11": new Register(11), "R12": new Register(12),
                "R13": new Register(13), "R14": new Register(14), "R15": new Register(15),
                "R16": new Register(16), "R17": new Register(17), "R18": new Register(18),
                "R19": new Register(19), "R20": new Register(20), "R21": new Register(21),
                "R22": new Register(22), "R23": new Register(23), "R24": new Register(24),
                "R25": new Register(25), "R26": new Register(26), "R27": new Register(27),
                "R28": new Register(28), "R29": new Register(29), "R30": new Register(30),
                "R31": new Register(31)

            }

        },
        init2: function () {
            this.clock = -1;     // 初始时钟周期
            this.maxFetchSize = 10;     //可同时运行的最大指令数
            this.instructions = [];   // 输入的指令数组
            this.fetched = [];  // 就绪或正在执行的指令数组

            this.functionUnitSet = {//实例化功能部件，Integer执行周期为1，乘法为10，加法为2，除法为40
                "Integer": new FunctionUnit("Integer", 1),
                "Mult1": new FunctionUnit("Mult1", 10),
                "Mult2": new FunctionUnit("Mult2", 10),
                "Add": new FunctionUnit("Add", 2),
                "Divide": new FunctionUnit("Divide", 40)
            };

            this.opToFunctionUnit = {//将功能部件分组
                "LD": ["Integer"],
                "MULT": ["Mult1", "Mult2"],
                "SUBD": ["Add"],
                "DIVD": ["Divide"],
                "ADDD": ["Add"]
            }


        },
        isInInstructionSet: function (op) {//判断输入指令操作符是否存在
            return this.opToFunctionUnit[op] ? true : false;
        },
        fetchIntruction: function () {//若未超过最大并行指令数，则把输入指令系列的一条放入就绪指令序列
            var temp = this.instructions.shift();
            var count = this.fetched.filter(function (element) {
                return !element.isFinished();
            }).length;
            if (temp && count < this.maxFetchSize) {
                this.fetched.push(temp);
            }
        },
        addInstruction: function (instruction) {//把输入的指令放入指令数组中
            this.instructions.push(instruction);
        },
        getNotExecInctruction: function () {//获取指令数组
            return this.instructions;
        },
        forward: function () {//进行下一周期
            this.clock++;
            this.fetchIntruction();
            // var issue = [];
            var that = this;
            for (var key in this.functionUnitSet) {//所有功能部件执行下一周期
                this.functionUnitSet[key].forwardPipeline(this.registers, this.clock);
            }
            // 更新功能部件信息
            for (var key in this.functionUnitSet) {
                this.functionUnitSet[key].updateInfo(this.registers);
            }
            // 尝试执行指令
            for (var i = 0; i < this.fetched.length; i++) {
                var element = this.fetched[i];
                // 尝试执行一条未执行的指令
                if (!element.isRunning()) {
                    var unitnames = this.opToFunctionUnit[element.Op];
                    for (var i = 0; i < unitnames.length; i++) {
                        var unit = this.functionUnitSet[unitnames[i]];
                        if (unit.loadInstruction(element, this.registers, this.clock)) {
                            // issue.push(unit);
                            break;
                        }
                    }
                    break;
                }
            }
            // 判断所有指令是否执行完毕
            var count = this.fetched.filter(function (element) {
                return !element.isFinished();
            }).length;
            return count == 0 ? false : true;
        }

    };
// window.Controller=Controller;
// }());