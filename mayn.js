  // بيانات التخزين
        let debts = JSON.parse(localStorage.getItem('debts')) || [];
        let currentDebtId = null;
        let filteredDebts = [...debts];

        // عناصر DOM
        const debtsContainer = document.getElementById('debts-container');
        const totalAmountElement = document.getElementById('total-amount');
        const debtorsCountElement = document.getElementById('debtors-count');
        const activeDebtsElement = document.getElementById('active-debts');
        const addDebtBtn = document.getElementById('add-debt-btn');
        const searchInput = document.getElementById('search-input');
        const clearSearchBtn = document.getElementById('clear-search');
        const notification = document.getElementById('notification');

        // النوافذ المنبثقة
        const deductModal = document.getElementById('deduct-modal');
        const editModal = document.getElementById('edit-modal');
        const addModal = document.getElementById('add-modal');
        const historyModal = document.getElementById('history-modal');

        // تهيئة التطبيق
        document.addEventListener('DOMContentLoaded', () => {
            updateStats();
            renderDebts();
            setupEventListeners();
        });

        // إعداد مستمعي الأحداث
        function setupEventListeners() {
            // إضافة دين جديد
            addDebtBtn.addEventListener('click', addNewDebt);
            
            // البحث
            searchInput.addEventListener('input', filterDebts);
            clearSearchBtn.addEventListener('click', clearSearch);
            
            // النوافذ المنبثقة
            document.getElementById('deduct-cancel').addEventListener('click', () => deductModal.style.display = 'none');
            document.getElementById('edit-cancel').addEventListener('click', () => editModal.style.display = 'none');
            document.getElementById('add-cancel').addEventListener('click', () => addModal.style.display = 'none');
            document.getElementById('history-close').addEventListener('click', () => historyModal.style.display = 'none');
            
            // تأكيد الإجراءات
            document.getElementById('deduct-confirm').addEventListener('click', deductAmount);
            document.getElementById('edit-confirm').addEventListener('click', editDebtAmount);
            document.getElementById('add-confirm').addEventListener('click', addToDebtAmount);
            
            // السماح بإضافة الدين باستعمال زر Enter
            document.getElementById('new-name').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') addNewDebt();
            });

            document.getElementById('new-amount').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') addNewDebt();
            });
        }

        // إضافة دين جديد
        function addNewDebt() {
            const nameInput = document.getElementById('new-name');
            const amountInput = document.getElementById('new-amount');
            const phoneInput = document.getElementById('new-phone');
            
            const name = nameInput.value.trim();
            const amount = parseInt(amountInput.value);
            const phone = phoneInput.value.trim();
            
            if (!name || !amount || amount <= 0) {
                showNotification('يرجى إدخال اسم المدين ومبلغ صحيح', 'error');
                return;
            }
            
            const newDebt = {
                id: Date.now().toString(),
                name,
                amount,
                phone: phone || 'غير مسجل',
                history: [{
                    type: 'إنشاء',
                    amount: amount,
                    date: getCurrentDateTime()
                }]
            };
            
            debts.push(newDebt);
            filteredDebts = [...debts];
            saveDebts();
            updateStats();
            renderDebts();
            
            // إعادة تعيين الحقول
            nameInput.value = '';
            amountInput.value = '';
            phoneInput.value = '';
            
            showNotification('تم إضافة المدين الجديد بنجاح');
        }

        // الحصول على التاريخ والوقت الحالي
        function getCurrentDateTime() {
            const now = new Date();
            const date = now.toLocaleDateString('ar-EG');
            const time = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
            return `${date} ${time}`;
        }

        // عرض الديون
        function renderDebts() {
            if (filteredDebts.length === 0) {
                debtsContainer.innerHTML = `
                    <div class="no-debts">
                        <i class="fas fa-file-invoice-dollar"></i>
                        <p>${debts.length === 0 ? 'لا توجد ديون مسجلة في النظام' : 'لا توجد نتائج مطابقة للبحث'}</p>
                    </div>
                `;
                return;
            }
            
            debtsContainer.innerHTML = filteredDebts.map(debt => {
                const lastOperation = debt.history && debt.history.length > 0 
                    ? debt.history[debt.history.length - 1] 
                    : null;
                    
                return `
                <div class="debt-card">
                    <h3>${debt.name}</h3>
                    <p><i class="fas fa-phone"></i> ${debt.phone}</p>
                    <div class="amount">${debt.amount.toLocaleString()} ج.م</div>
                    ${lastOperation ? `
                    <div class="debt-history">
                        <div>
                            <span>آخر عملية: ${lastOperation.type}</span>
                            <span class="history-date">${lastOperation.date}</span>
                        </div>
                    </div>
                    ` : ''}
                    <div class="debt-actions">
                        <button class="action-btn btn-deduct" onclick="openDeductModal('${debt.id}')">
                            <i class="fas fa-minus"></i> تسديد
                        </button>
                        <button class="action-btn btn-edit" onclick="openEditModal('${debt.id}')">
                            <i class="fas fa-edit"></i> تعديل
                        </button>
                        <button class="action-btn btn-add" onclick="openAddModal('${debt.id}')">
                            <i class="fas fa-plus"></i> إضافة
                        </button>
                        <button class="action-btn btn-history" onclick="showHistory('${debt.id}')">
                            <i class="fas fa-history"></i> السجل
                        </button>
                        <button class="action-btn btn-delete" onclick="deleteDebt('${debt.id}')">
                            <i class="fas fa-trash"></i> حذف
                        </button>
                    </div>
                </div>
                `;
            }).join('');
        }

        // تصفية الديون حسب البحث
        function filterDebts() {
            const searchTerm = searchInput.value.trim().toLowerCase();
            
            if (searchTerm === '') {
                filteredDebts = [...debts];
            } else {
                filteredDebts = debts.filter(debt => 
                    debt.name.toLowerCase().includes(searchTerm)
                );
            }
            
            renderDebts();
        }

        // مسح البحث
        function clearSearch() {
            searchInput.value = '';
            filteredDebts = [...debts];
            renderDebts();
        }

        // فتح نوافذ التعديل
        function openDeductModal(id) {
            currentDebtId = id;
            document.getElementById('deduct-amount').value = '';
            document.getElementById('deduct-description').value = '';
            deductModal.style.display = 'flex';
        }

        function openEditModal(id) {
            currentDebtId = id;
            const debt = debts.find(d => d.id === id);
            document.getElementById('edit-amount').value = debt.amount;
            editModal.style.display = 'flex';
        }

        function openAddModal(id) {
            currentDebtId = id;
            document.getElementById('add-amount').value = '';
            document.getElementById('add-description').value = '';
            addModal.style.display = 'flex';
        }

        // إجراءات التعديل
        function deductAmount() {
            const amount = parseInt(document.getElementById('deduct-amount').value);
            const description = document.getElementById('deduct-description').value.trim();
            
            if (!amount || amount <= 0) {
                showNotification('يرجى إدخال مبلغ صحيح', 'error');
                return;
            }
            
            const debtIndex = debts.findIndex(d => d.id === currentDebtId);
            if (debts[debtIndex].amount < amount) {
                showNotification('المبلغ المطلوب تسديده أكبر من قيمة الدين', 'error');
                return;
            }
            
            debts[debtIndex].amount -= amount;
            
            // إضافة العملية إلى السجل
            const updatedHistory = debts[debtIndex].history || [];
            updatedHistory.push({
                type: 'خصم',
                amount: amount,
                description: description || 'تسديد جزء من الدين',
                date: getCurrentDateTime()
            });
            
            debts[debtIndex].history = updatedHistory;
            
            saveDebts();
            updateStats();
            renderDebts();
            deductModal.style.display = 'none';
            
            showNotification('تم تسديد المبلغ بنجاح');
        }

        function editDebtAmount() {
            const amount = parseInt(document.getElementById('edit-amount').value);
            if (!amount || amount < 0) {
                showNotification('يرجى إدخال مبلغ صحيح', 'error');
                return;
            }

            const debtIndex = debts.findIndex(d => d.id === currentDebtId);
            const oldAmount = debts[debtIndex].amount;
            debts[debtIndex].amount = amount;
            
            // إضافة العملية إلى السجل
            const updatedHistory = debts[debtIndex].history || [];
            updatedHistory.push({
                type: 'تعديل',
                oldAmount: oldAmount,
                newAmount: amount,
                description: 'تعديل قيمة الدين',
                date: getCurrentDateTime()
            });
            
            debts[debtIndex].history = updatedHistory;
            
            saveDebts();
            updateStats();
            renderDebts();
            editModal.style.display = 'none';
            
            showNotification('تم تعديل قيمة الدين بنجاح');
        }

        function addToDebtAmount() {
            const amount = parseInt(document.getElementById('add-amount').value);
            const description = document.getElementById('add-description').value.trim();
            
            if (!amount || amount <= 0) {
                showNotification('يرجى إدخال مبلغ صحيح', 'error');
                return;
            }
            
            const debtIndex = debts.findIndex(d => d.id === currentDebtId);
            debts[debtIndex].amount += amount;
            
            // إضافة العملية إلى السجل
            const updatedHistory = debts[debtIndex].history || [];
            updatedHistory.push({
                type: 'إضافة',
                amount: amount,
                description: description || 'إضافة إلى الدين',
                date: getCurrentDateTime()
            });
            
            debts[debtIndex].history = updatedHistory;
            
            saveDebts();
            updateStats();
            renderDebts();
            addModal.style.display = 'none';
            
            showNotification('تم إضافة المبلغ إلى الدين بنجاح');
        }

        // عرض السجل
        function showHistory(id) {
            const debt = debts.find(d => d.id === id);
            const historyList = document.getElementById('history-list');
            
            if (!debt || !debt.history) {
                historyList.innerHTML = '<div class="history-item">لا توجد عمليات مسجلة</div>';
            } else {
                historyList.innerHTML = debt.history.map(operation => {
                    let recordHtml = '';
                    
                    if (operation.type === 'إنشاء') {
                        recordHtml = `
                            <div class="history-item">
                                <div class="history-details">
                                    <div class="history-type">إنشاء دين جديد</div>
                                    ${operation.description ? `<div class="history-description">${operation.description}</div>` : ''}
                                    <div class="history-date">${operation.date}</div>
                                </div>
                                <div class="history-actions">
                                    <span class="history-amount">${operation.amount} ج.م</span>
                                </div>
                            </div>
                        `;
                    } else if (operation.type === 'خصم') {
                        recordHtml = `
                            <div class="history-item">
                                <div class="history-details">
                                    <div class="history-type">تسديد من الدين</div>
                                    ${operation.description ? `<div class="history-description">${operation.description}</div>` : ''}
                                    <div class="history-date">${operation.date}</div>
                                </div>
                                <div class="history-actions">
                                    <span class="history-amount deducted">-${operation.amount} ج.م</span>
                                </div>
                            </div>
                        `;
                    } else if (operation.type === 'إضافة') {
                        recordHtml = `
                            <div class="history-item">
                                <div class="history-details">
                                    <div class="history-type">إضافة إلى الدين</div>
                                    ${operation.description ? `<div class="history-description">${operation.description}</div>` : ''}
                                    <div class="history-date">${operation.date}</div>
                                </div>
                                <div class="history-actions">
                                    <span class="history-amount added">+${operation.amount} ج.م</span>
                                </div>
                            </div>
                        `;
                    } else if (operation.type === 'تعديل') {
                        recordHtml = `
                            <div class="history-item">
                                <div class="history-details">
                                    <div class="history-type">تعديل قيمة الدين</div>
                                    ${operation.description ? `<div class="history-description">${operation.description}</div>` : ''}
                                    <div class="history-date">${operation.date}</div>
                                </div>
                                <div class="history-actions">
                                    <span class="history-amount edited">${operation.oldAmount} → ${operation.newAmount} ج.م</span>
                                </div>
                            </div>
                        `;
                    }
                    
                    return recordHtml;
                }).join('');
            }
            
            historyModal.style.display = 'flex';
        }

        // حذف الدين
        function deleteDebt(id) {
            if (confirm('هل أنت متأكد من حذف هذا الدين؟')) {
                debts = debts.filter(d => d.id !== id);
                filteredDebts = [...debts];
                saveDebts();
                updateStats();
                renderDebts();
                showNotification('تم حذف الدين بنجاح');
            }
        }

        // تحديث الإحصائيات
        function updateStats() {
            const totalAmount = debts.reduce((sum, debt) => sum + debt.amount, 0);
            const debtorsCount = debts.length;
            const activeDebts = debts.filter(d => d.amount > 0).length;
            
            totalAmountElement.textContent = `${totalAmount.toLocaleString()} ج.م`;
            debtorsCountElement.textContent = debtorsCount;
            activeDebtsElement.textContent = activeDebts;
        }

        // حفظ البيانات في localStorage
        function saveDebts() {
            localStorage.setItem('debts', JSON.stringify(debts));
        }

        // عرض الإشعارات
        function showNotification(message, type = 'success') {
            notification.textContent = message;
            notification.className = 'notification';
            notification.classList.add(type === 'error' ? 'error' : 'success');
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }