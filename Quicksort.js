let array = [];
    let delayTime = 800;
    let isSorting = false;
    let stopFlag = false;

    // 테마 설정 (기본값 Dark)
    function toggleTheme() {
        const html = document.documentElement;
        const icon = document.getElementById('themeIcon');
        if (html.getAttribute('data-theme') === 'dark') {
            html.setAttribute('data-theme', 'light');
            icon.className = 'fas fa-sun';
            icon.style.color = '#f59e0b'; // Sun color
        } else {
            html.setAttribute('data-theme', 'dark');
            icon.className = 'fas fa-moon';
            icon.style.color = '#ffffff';
        }
    }

    // 배열 생성
    function generateArray() {
        if (isSorting) return;
        const countInput = document.getElementById('boxCount');
        let count = parseInt(countInput.value);
        if (count < 5) count = 5;
        if (count > 10) count = 10;
        countInput.value = count;

        array = [];
        const container = document.getElementById('container');
        container.innerHTML = '';
        addLog('새로운 배열이 생성되었습니다.', 'highlight');

        for (let i = 0; i < count; i++) {
            const val = Math.floor(Math.random() * 50) + 1;
            array.push(val);

            const containerDiv = document.createElement('div');
            containerDiv.className = 'box-container';
            containerDiv.id = `wrapper-${i}`;

            const box = document.createElement('div');
            box.className = 'box';
            box.id = `box-${i}`;
            box.innerText = val;

            const label = document.createElement('div');
            label.className = 'label';
            label.id = `label-${i}`;

            containerDiv.appendChild(box);
            containerDiv.appendChild(label);
            container.appendChild(containerDiv);
        }
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function updateSpeed() {
        const val = document.getElementById('speedRange').value;
        delayTime = 1600 - val; 
        const display = document.getElementById('speedDisplay');
        if(delayTime < 400) display.innerText = "Max";
        else if(delayTime > 1000) display.innerText = "Slow";
        else display.innerText = "Normal";
    }

    function addLog(msg, type = 'normal') {
        const panel = document.getElementById('logPanel');
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        if(type === 'highlight') entry.classList.add('log-highlight');
        
        entry.innerHTML = `> ${msg}`;
        panel.appendChild(entry);
        panel.scrollTop = panel.scrollHeight;
    }

    function updateVisualState(pivotIdx, lowIdx, highIdx) {
        for (let i = 0; i < array.length; i++) {
            const box = document.getElementById(`box-${i}`);
            const label = document.getElementById(`label-${i}`);
            
            if (!box.classList.contains('fixed')) {
                box.className = 'box'; 
            }
            label.innerHTML = '';
            label.className = 'label';
        }

        if (pivotIdx !== null && pivotIdx >= 0) {
            const pBox = document.getElementById(`box-${pivotIdx}`);
            const pLabel = document.getElementById(`label-${pivotIdx}`);
            if(!pBox.classList.contains('fixed')) {
                pBox.classList.add('pivot');
                pLabel.innerHTML = 'PIVOT';
                pLabel.classList.add('p-text');
            }
        }

        if (lowIdx !== null && lowIdx < array.length) {
            const lBox = document.getElementById(`box-${lowIdx}`);
            const lLabel = document.getElementById(`label-${lowIdx}`);
            if(!lBox.classList.contains('fixed')) {
                lBox.classList.add('low');
                let txt = lLabel.innerHTML;
                lLabel.innerHTML = txt ? txt + '<br>Low' : 'Low';
                lLabel.classList.add('l-text');
            }
        }

        if (highIdx !== null && highIdx >= 0) {
            const hBox = document.getElementById(`box-${highIdx}`);
            const hLabel = document.getElementById(`label-${highIdx}`);
            if(!hBox.classList.contains('fixed')) {
                hBox.classList.add('high');
                let txt = hLabel.innerHTML;
                hLabel.innerHTML = txt ? txt + '<br>High' : 'High';
                hLabel.classList.add('h-text');
            }
        }
    }

    // 물리적 교환 애니메이션
    async function swapAnimate(idx1, idx2) {
        if (idx1 === idx2) return;

        const box1 = document.getElementById(`box-${idx1}`);
        const box2 = document.getElementById(`box-${idx2}`);

        const rect1 = box1.getBoundingClientRect();
        const rect2 = box2.getBoundingClientRect();
        const distance = rect2.left - rect1.left;

        box1.style.transform = `translateX(${distance}px)`;
        box2.style.transform = `translateX(${-distance}px)`;
        box1.style.zIndex = 100;
        box2.style.zIndex = 100;

        await sleep(delayTime);

        let temp = array[idx1];
        array[idx1] = array[idx2];
        array[idx2] = temp;

        box1.innerText = array[idx1];
        box2.innerText = array[idx2];

        box1.style.transition = 'none';
        box2.style.transition = 'none';
        box1.style.transform = 'translateX(0)';
        box2.style.transform = 'translateX(0)';
        box1.style.zIndex = '';
        box2.style.zIndex = '';

        box1.offsetHeight; 
        
        await sleep(50);
        box1.style.transition = ''; 
        box2.style.transition = '';
    }

    function stopSort() {
        if(isSorting) {
            stopFlag = true;
            addLog("사용자에 의해 중단되었습니다.", "highlight");
        }
    }

    async function startSort() {
        if (array.length === 0) generateArray();
        if (isSorting) return;
        
        isSorting = true;
        stopFlag = false;
        
        document.getElementById('startBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;
        document.getElementById('boxCount').disabled = true;
        
        addLog("Quick Sort 시작", "highlight");

        await quickSort(0, array.length - 1);

        if(!stopFlag) {
            addLog("정렬 완료!", "highlight");
            updateVisualState(null, null, null);
        } else {
             updateVisualState(null, null, null);
        }

        isSorting = false;
        document.getElementById('startBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
        document.getElementById('boxCount').disabled = false;
    }

    async function quickSort(start, end) {
        if (stopFlag) return;

        if (start >= end) {
            if (start === end) {
                document.getElementById(`box-${start}`).classList.add('fixed');
            }
            return;
        }

        let pivotIndex = await partition(start, end);

        if (stopFlag) return;

        await quickSort(start, pivotIndex - 1);
        await quickSort(pivotIndex + 1, end);
    }

    async function partition(start, end) {
        if (stopFlag) return start;

        let pivot = array[start];
        let low = start + 1;
        let high = end;

        addLog(`Pivot 설정: ${pivot}`, "highlight");
        updateVisualState(start, low, high);
        await sleep(delayTime);

        while (low <= high) {
            if (stopFlag) return start;

            while (low <= end && array[low] <= pivot) {
                if (stopFlag) return start;
                low++;
                updateVisualState(start, low, high);
                await sleep(delayTime / 3);
            }

            while (high > start && array[high] >= pivot) {
                if (stopFlag) return start;
                high--;
                updateVisualState(start, low, high);
                await sleep(delayTime / 3);
            }

            if (low > high) {
                addLog(`교차됨 (Low > High)`);
                updateVisualState(start, low, high);
                await sleep(delayTime);
            } else {
                addLog(`교환: ${array[low]} <-> ${array[high]}`);
                await swapAnimate(low, high);
                updateVisualState(start, low, high);
            }
        }

        if (stopFlag) return start;

        addLog(`Pivot(${array[start]}) 위치 확정`);
        await swapAnimate(start, high);
        
        document.getElementById(`box-${high}`).classList.add('fixed');
        return high;
    }

    generateArray();