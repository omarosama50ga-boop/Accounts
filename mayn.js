
        // بيانات التخزين
        let debts = JSON.parse(localStorage.getItem('debts')) || [
            { 
                id: '1', 
                name: 'أحمد محمد', 
                amount: 5000, 
                phone: '0123456789',
                history: [
                    { type: 'إنشاء', amount: 5000, date: '2023-10-15 10:30' }
                ]
            },
            { 
                id: '2', 
                name: 'محمد علي', 
                amount: 3000, 
                phone: '0111222333',
                history: [
                    { type: 'إنشاء', amount: 3000, date: '2023-10-10 14:20' }
                ]
            },
            { 
                id: '3', 
                name: 'علي حسين', 
                amount: 7000, 
                phone: '0100444555',
                history: [
                    { type: 'إنشاء', amount: 7000, date: '2023-10-05 09:15' }
                ]
            }
        ];

        // عناصر DOM
        const debtsContainer = document.getElementById('debts-container');
        const totalAmountEl = document.getElementById('total-amount');
        const debtorsCountEl = document.getElementById('debtors-count');
        const activeDebtsEl = document.getElementById('active-debts');
        const newNameInput = document.getElementById('new-name');
        const newAmountInput = document.getElementById('new-amount');
        const newPhoneInput = document.getElementById('new-phone');
        const addDebtBtn = document.getElementById('add-debt-btn');

        // عناصر الـ Modals
        const deductModal = document.getElementById('deduct-modal');
        const deductAmountInput = document.getElementById('deduct-amount');
        const deductConfirmBtn = document.getElementById('deduct-confirm');
        const deductCancelBtn = document.getElementById('deduct-cancel');

        const editModal = document.getElementById('edit-modal');
        const editAmountInput = document.getElementById('edit-amount');
        const editConfirmBtn = document.getElementById('edit-confirm');
        const editCancelBtn = document.getElementById('edit-cancel');

        // العناصر الجديدة للإضافة
        const addModal = document.getElementById('add-modal');
        const addAmountInput = document.getElementById('add-amount');
        const addConfirmBtn = document.getElementById('add-confirm');
        const addCancelBtn = document.getElementById('add-cancel');

        // عناصر سجل العمليات
        const historyModal = document.getElementById('history-modal');
        const historyList = document.getElementById('history-list');
        const historyClose = document.getElementById('history-close');

        // المتغيرات المؤقتة
        let currentDebtId = null;

        // دالة للحصول على التاريخ والوقت الحالي
        function getCurrentDateTime() {
            const now = new Date();
            const date = now.toLocaleDateString('ar-EG');
            const time = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
            return `${date} ${time}`;
        }

        // تحديث الإحصائيات
        function updateStats() {
            const total = debts.reduce((sum, debt) => sum + debt.amount, 0);
            const active = debts.filter(d => d.amount > 0).length;
            
            totalAmountEl.textContent = `${total.toLocaleString()} ج.م`;
            debtorsCountEl.textContent = debts.length;
            activeDebtsEl.textContent = active;
            
            // حفظ البيانات في localStorage
            localStorage.setItem('debts', JSON.stringify(debts));
        }

        // عرض الديون
        function renderDebts() {
            if (debts.length === 0) {
                debtsContainer.innerHTML = `
                    <div class="no-debts">
                        <i class="fas fa-file-invoice-dollar"></i>
                        <p>لا توجد ديون مسجلة حالياً</p>
                    </div>
                `;
                return;
            }

            debtsContainer.innerHTML = '';
            
            debts.forEach(debt => {
                const lastOperation = debt.history && debt.history.length > 0 
                    ? debt.history[debt.history.length - 1] 
                    : null;
                
                const debtCard = document.createElement('div');
                debtCard.className = 'debt-card';
                debtCard.innerHTML = `
                    <div class="debt-header">
                        <div class="debt-name">${debt.name}</div>
                        <div class="debt-amount">${debt.amount.toLocaleString()} ج.م</div>
                    </div>
                    ${debt.phone ? `<div class="debt-phone"><i class="fas fa-phone"></i> ${debt.phone}</div>` : ''}
                    
                    ${lastOperation ? `
                    <div class="debt-history">
                        <div>
                            <span>آخر عملية: ${lastOperation.type}</span>
                            <span class="history-date">${lastOperation.date}</span>
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="debt-actions">
                        <div class="action-group">
                            <button class="btn-deduct deduct-btn" data-id="${debt.id}">
                                <i class="fas fa-minus-circle"></i> خصم
                            </button>
                            <button class="btn-edit edit-btn" data-id="${debt.id}">
                                <i class="fas fa-edit"></i> تعديل
                            </button>
                        </div>
                        <div class="action-group">
                            <button class="btn-add add-btn" data-id="${debt.id}">
                                <i class="fas fa-plus-circle"></i> إضافة
                            </button>
                            <button class="btn-history history-btn" data-id="${debt.id}">
                                <i class="fas fa-history"></i> السجل
                            </button>
                            <button class="btn-delete delete-btn" data-id="${debt.id}">
                                <i class="fas fa-trash"></i> حذف
                            </button>
                        </div>
                    </div>
                `;
                debtsContainer.appendChild(debtCard);
            });

            // إضافة event listeners للأزرار
            document.querySelectorAll('.deduct-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    currentDebtId = e.target.closest('.deduct-btn').dataset.id;
                    deductAmountInput.value = '';
                    deductModal.style.display = 'flex';
                });
            });

            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    currentDebtId = e.target.closest('.edit-btn').dataset.id;
                    const debt = debts.find(d => d.id === currentDebtId);
                    editAmountInput.value = debt.amount;
                    editModal.style.display = 'flex';
                });
            });

            // إضافة event listener للزر الجديد
            document.querySelectorAll('.add-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    currentDebtId = e.target.closest('.add-btn').dataset.id;
                    addAmountInput.value = '';
                    addModal.style.display = 'flex';
                });
            });

            // إضافة event listener لزر السجل
            document.querySelectorAll('.history-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    currentDebtId = e.target.closest('.history-btn').dataset.id;
                    showHistory(currentDebtId);
                });
            });

            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.closest('.delete-btn').dataset.id;
                    if (confirm('هل أنت متأكد من حذف هذا الدين؟')) {
                        debts = debts.filter(d => d.id !== id);
                        renderDebts();
                        updateStats();
                    }
                });
            });
        }

        // عرض سجل العمليات
        function showHistory(debtId) {
            const debt = debts.find(d => d.id === debtId);
            if (!debt || !debt.history) {
                historyList.innerHTML = '<div class="history-item">لا توجد عمليات مسجلة</div>';
            } else {
                historyList.innerHTML = '';
                debt.history.forEach(operation => {
                    const historyItem = document.createElement('div');
                    historyItem.className = 'history-item';
                    historyItem.innerHTML = `
                        <div>
                            <span class="history-type">${operation.type}</span>
                            ${operation.amount ? `<span class="history-amount">${operation.amount.toLocaleString()} ج.م</span>` : ''}
                        </div>
                        <span class="history-date">${operation.date}</span>
                    `;
                    historyList.appendChild(historyItem);
                });
            }
            historyModal.style.display = 'flex';
        }

        // إضافة دين جديد
        function addNewDebt() {
            const name = newNameInput.value.trim();
            const amount = parseInt(newAmountInput.value);
            const phone = newPhoneInput.value.trim();

            if (!name || isNaN(amount) || amount <= 0) {
                alert('يرجى إدخال اسم الشخص والمبلغ بشكل صحيح');
                return;
            }

            const newDebt = {
                id: Date.now().toString(),
                name,
                amount,
                phone: phone || undefined,
                history: [
                    { type: 'إنشاء', amount: amount, date: getCurrentDateTime() }
                ]
            };

            debts.push(newDebt);
            
            // مسح حقول الإدخال
            newNameInput.value = '';
            newAmountInput.value = '';
            newPhoneInput.value = '';
            
            renderDebts();
            updateStats();
        }

        // خصم مبلغ من الدين
        function deductAmount() {
            const amount = parseInt(deductAmountInput.value);
            
            if (isNaN(amount) || amount <= 0) {
                alert('يرجى إدخال مبلغ صحيح للخصم');
                return;
            }

            debts = debts.map(debt => {
                if (debt.id === currentDebtId) {
                    const newAmount = Math.max(0, debt.amount - amount);
                    
                    // إضافة العملية إلى السجل
                    const updatedHistory = debt.history || [];
                    updatedHistory.push({
                        type: 'خصم',
                        amount: amount,
                        date: getCurrentDateTime()
                    });
                    
                    return { 
                        ...debt, 
                        amount: newAmount,
                        history: updatedHistory
                    };
                }
                return debt;
            });

            deductModal.style.display = 'none';
            renderDebts();
            updateStats();
        }

        // تعديل مبلغ الدين
        function editAmount() {
            const amount = parseInt(editAmountInput.value);
            
            if (isNaN(amount) || amount < 0) {
                alert('يرجى إدخال مبلغ صحيح');
                return;
            }

            debts = debts.map(debt => {
                if (debt.id === currentDebtId) {
                    // إضافة العملية إلى السجل
                    const updatedHistory = debt.history || [];
                    updatedHistory.push({
                        type: 'تعديل',
                        amount: amount,
                        date: getCurrentDateTime()
                    });
                    
                    return { 
                        ...debt, 
                        amount: amount,
                        history: updatedHistory
                    };
                }
                return debt;
            });

            editModal.style.display = 'none';
            renderDebts();
            updateStats();
        }

        // إضافة مبلغ إلى الدين الحالي
        function addAmount() {
            const amount = parseInt(addAmountInput.value);
            
            if (isNaN(amount) || amount <= 0) {
                alert('يرجى إدخال مبلغ صحيح للإضافة');
                return;
            }

            debts = debts.map(debt => {
                if (debt.id === currentDebtId) {
                    const newAmount = debt.amount + amount;
                    
                    // إضافة العملية إلى السجل
                    const updatedHistory = debt.history || [];
                    updatedHistory.push({
                        type: 'إضافة',
                        amount: amount,
                        date: getCurrentDateTime()
                    });
                    
                    return { 
                        ...debt, 
                        amount: newAmount,
                        history: updatedHistory
                    };
                }
                return debt;
            });

            addModal.style.display = 'none';
            renderDebts();
            updateStats();
        }

        // event listeners
        addDebtBtn.addEventListener('click', addNewDebt);

        deductConfirmBtn.addEventListener('click', deductAmount);
        deductCancelBtn.addEventListener('click', () => {
            deductModal.style.display = 'none';
        });

        editConfirmBtn.addEventListener('click', editAmount);
        editCancelBtn.addEventListener('click', () => {
            editModal.style.display = 'none';
        });

        // إضافة event listeners للزر الجديد
        addConfirmBtn.addEventListener('click', addAmount);
        addCancelBtn.addEventListener('click', () => {
            addModal.style.display = 'none';
        });

        // إضافة event listener لإغلاق سجل العمليات
        historyClose.addEventListener('click', () => {
            historyModal.style.display = 'none';
        });

        // السماح بإضافة الدين باستعمال زر Enter
        newNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addNewDebt();
        });

        newAmountInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addNewDebt();
        });

        // تهيئة الصفحة
        function init() {
            renderDebts();
            updateStats();
        }

        // تشغيل التهيئة عند تحميل الصفحة
        window.addEventListener('DOMContentLoaded', init);