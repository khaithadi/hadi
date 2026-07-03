import { createContext, useContext } from 'react';

// Lightweight i18n: a flat key → { ar, fr, en } dictionary + a useT() hook.
// Arabic is the source/default and the fallback for any missing translation.
// The printed document (DocPrint) stays French regardless of the UI language.

export const LANGUAGES = [
  { id: 'ar', label: 'العربية' },
  { id: 'fr', label: 'Français' },
  { id: 'en', label: 'English' },
];

export const DICT = {
  // ---- common ----
  'c.save':    { ar: 'حفظ', fr: 'Enregistrer', en: 'Save' },
  'c.cancel':  { ar: 'إلغاء', fr: 'Annuler', en: 'Cancel' },
  'c.back':    { ar: 'رجوع', fr: 'Retour', en: 'Back' },
  'c.edit':    { ar: 'تعديل', fr: 'Modifier', en: 'Edit' },
  'c.delete':  { ar: 'حذف', fr: 'Supprimer', en: 'Delete' },
  'c.add':     { ar: 'إضافة', fr: 'Ajouter', en: 'Add' },
  'c.close':   { ar: 'إغلاق', fr: 'Fermer', en: 'Close' },
  'c.print':   { ar: 'طباعة', fr: 'Imprimer', en: 'Print' },
  'c.copy':    { ar: 'نسخ', fr: 'Copier', en: 'Copy' },
  'c.copied':  { ar: 'تم ✓', fr: 'Copié ✓', en: 'Copied ✓' },
  'c.whatsapp':{ ar: 'واتساب', fr: 'WhatsApp', en: 'WhatsApp' },
  'c.search':  { ar: 'بحث…', fr: 'Rechercher…', en: 'Search…' },
  'c.optional':{ ar: '(اختياري)', fr: '(optionnel)', en: '(optional)' },
  'c.general': { ar: 'عام', fr: 'Général', en: 'General' },
  'c.from':    { ar: 'من', fr: 'Du', en: 'From' },
  'c.to':      { ar: 'إلى', fr: 'Au', en: 'To' },
  'c.all':     { ar: 'الكل', fr: 'Tout', en: 'All' },
  'c.date':    { ar: 'التاريخ', fr: 'Date', en: 'Date' },
  'c.amount':  { ar: 'المبلغ', fr: 'Montant', en: 'Amount' },
  'c.notes':   { ar: 'ملاحظات', fr: 'Notes', en: 'Notes' },
  'c.notesOpt':{ ar: 'ملاحظات (اختياري)', fr: 'Notes (optionnel)', en: 'Notes (optional)' },
  'c.phone':   { ar: 'رقم الهاتف', fr: 'Téléphone', en: 'Phone' },
  'c.status':  { ar: 'الحالة', fr: 'Statut', en: 'Status' },
  'c.remove':  { ar: 'إزالة', fr: 'Retirer', en: 'Remove' },

  // ---- nav / titles ----
  'nav.dashboard': { ar: 'الرئيسية', fr: 'Accueil', en: 'Home' },
  'nav.customers': { ar: 'العملاء', fr: 'Clients', en: 'Customers' },
  'nav.quotes':    { ar: 'العروض', fr: 'Devis', en: 'Quotes' },
  'nav.invoices':  { ar: 'الفواتير', fr: 'Factures', en: 'Invoices' },
  'nav.expenses':  { ar: 'المصاريف', fr: 'Dépenses', en: 'Expenses' },

  't.customer':      { ar: 'ملف العميل', fr: 'Fiche client', en: 'Customer file' },
  't.customerNew':   { ar: 'عميل جديد', fr: 'Nouveau client', en: 'New customer' },
  't.customerEdit':  { ar: 'تعديل العميل', fr: 'Modifier le client', en: 'Edit customer' },
  't.quoteNew':      { ar: 'عرض جديد', fr: 'Nouveau devis', en: 'New quote' },
  't.quoteEdit':     { ar: 'تعديل العرض', fr: 'Modifier le devis', en: 'Edit quote' },
  't.quoteDetail':   { ar: 'تفاصيل العرض', fr: 'Détails du devis', en: 'Quote details' },
  't.invoiceNew':    { ar: 'فاتورة جديدة', fr: 'Nouvelle facture', en: 'New invoice' },
  't.invoiceEdit':   { ar: 'تعديل الفاتورة', fr: 'Modifier la facture', en: 'Edit invoice' },
  't.invoiceDetail': { ar: 'تفاصيل الفاتورة', fr: 'Détails de la facture', en: 'Invoice details' },
  't.paymentForm':   { ar: 'تسجيل دفعة', fr: 'Enregistrer un paiement', en: 'Record payment' },
  't.expenseNew':    { ar: 'مصروف جديد', fr: 'Nouvelle dépense', en: 'New expense' },
  't.expenseEdit':   { ar: 'تعديل مصروف', fr: 'Modifier la dépense', en: 'Edit expense' },
  't.workerDetail':  { ar: 'ملف العامل', fr: 'Fiche ouvrier', en: 'Worker file' },
  't.workerNew':     { ar: 'عامل جديد', fr: 'Nouvel ouvrier', en: 'New worker' },
  't.workerEdit':    { ar: 'تعديل العامل', fr: "Modifier l'ouvrier", en: 'Edit worker' },
  't.laborForm':     { ar: 'مستحق جديد', fr: 'Nouveau dû', en: 'New due' },
  't.laborPayment':  { ar: 'دفعة لعامل', fr: 'Paiement ouvrier', en: 'Worker payment' },
  't.timesheetForm': { ar: 'تسجيل يوم', fr: 'Saisir un jour', en: 'Log a day' },
  't.periodPay':     { ar: 'دفع فترة', fr: 'Payer une période', en: 'Pay a period' },
  't.settings':      { ar: 'الإعدادات', fr: 'Paramètres', en: 'Settings' },

  // ---- dashboard ----
  'dash.revenue':     { ar: 'الإيرادات المحصّلة', fr: 'Revenus encaissés', en: 'Collected revenue' },
  'dash.expenses':    { ar: 'إجمالي المصاريف', fr: 'Total des dépenses', en: 'Total expenses' },
  'dash.netProfit':   { ar: 'صافي الربح', fr: 'Bénéfice net', en: 'Net profit' },
  'dash.outstanding': { ar: 'مستحقات لم تُدفع بعد', fr: 'Impayés en attente', en: 'Outstanding unpaid' },
  'dash.recent':      { ar: 'آخر الحركات', fr: 'Activité récente', en: 'Recent activity' },
  'dash.emptyRecent': { ar: 'لا توجد حركات بعد. ابدأ بإضافة عميل أو إنشاء فاتورة.', fr: "Aucune activité. Ajoutez un client ou créez une facture.", en: 'No activity yet. Add a customer or create an invoice.' },
  'dash.backupNudge': { ar: 'خُذ نسخة احتياطية من بياناتك حتى لا تفقدها — اضغط هنا.', fr: 'Sauvegardez vos données pour ne pas les perdre — appuyez ici.', en: 'Back up your data so you don’t lose it — tap here.' },
  'dash.invoiceWord': { ar: 'فاتورة', fr: 'Facture', en: 'Invoice' },

  // ---- customers ----
  'cust.searchPh':    { ar: '🔍 بحث عن عميل…', fr: '🔍 Rechercher un client…', en: '🔍 Search a customer…' },
  'cust.empty':       { ar: 'لا يوجد عملاء. اضغط + لإضافة عميل.', fr: 'Aucun client. Appuyez sur + pour en ajouter.', en: 'No customers. Tap + to add one.' },
  'cust.due':         { ar: 'مستحق', fr: 'dû', en: 'due' },
  'cust.info':        { ar: 'معلومات العميل', fr: 'Informations client', en: 'Customer info' },
  'cust.fullName':    { ar: 'الاسم الكامل', fr: 'Nom complet', en: 'Full name' },
  'cust.address':     { ar: 'العنوان', fr: 'Adresse', en: 'Address' },
  'cust.serviceType': { ar: 'نوع الخدمة', fr: 'Type de service', en: 'Service type' },
  'cust.leadSource':  { ar: 'مصدر العميل', fr: 'Source du client', en: 'Lead source' },
  'cust.addedOn':     { ar: 'تاريخ الإضافة', fr: 'Ajouté le', en: 'Added on' },
  'cust.finance':     { ar: 'الملخص المالي', fr: 'Résumé financier', en: 'Financial summary' },
  'cust.journey':     { ar: 'مسار الحالة', fr: 'Progression', en: 'Status journey' },
  'cust.projectValue':{ ar: 'قيمة المشروع', fr: 'Valeur du projet', en: 'Project value' },
  'cust.collected':   { ar: 'المحصّل', fr: 'Encaissé', en: 'Collected' },
  'cust.profit':      { ar: 'الربح التقديري', fr: 'Bénéfice estimé', en: 'Estimated profit' },
  'cust.profitability':{ ar: 'الربحية', fr: 'Rentabilité', en: 'Profitability' },
  'cust.delConfirm':  { ar: 'حذف العميل وكل ما يتعلق به؟', fr: 'Supprimer le client et tout ce qui s’y rattache ?', en: 'Delete the customer and everything linked?' },
  'cust.call':        { ar: 'اتصال', fr: 'Appeler', en: 'Call' },

  // ---- quotes ----
  'quote.searchPh':  { ar: '🔍 بحث بالعميل أو الرقم…', fr: '🔍 Client ou numéro…', en: '🔍 Customer or number…' },
  'quote.empty':     { ar: 'لا توجد عروض. اضغط + لإنشاء عرض.', fr: 'Aucun devis. Appuyez sur + pour en créer un.', en: 'No quotes. Tap + to create one.' },
  'quote.customer':  { ar: 'العميل', fr: 'Client', en: 'Customer' },
  'quote.addFirst':  { ar: 'أضِف عميلاً أولاً قبل إنشاء عرض.', fr: 'Ajoutez d’abord un client.', en: 'Add a customer first.' },
  'quote.addCustomer':{ ar: 'إضافة عميل', fr: 'Ajouter un client', en: 'Add customer' },
  'quote.create':    { ar: 'إنشاء العرض', fr: 'Créer le devis', en: 'Create quote' },
  'quote.delConfirm':{ ar: 'تأكيد حذف العرض؟', fr: 'Confirmer la suppression du devis ?', en: 'Delete this quote?' },
  'quote.delete':    { ar: 'حذف العرض', fr: 'Supprimer le devis', en: 'Delete quote' },
  'quote.convert':   { ar: 'تحويل إلى فاتورة', fr: 'Convertir en facture', en: 'Convert to invoice' },
  'quote.duplicate': { ar: 'نسخ العرض', fr: 'Dupliquer', en: 'Duplicate' },

  // ---- invoices ----
  'inv.searchPh':   { ar: '🔍 بحث بالعميل أو الرقم…', fr: '🔍 Client ou numéro…', en: '🔍 Customer or number…' },
  'inv.empty':      { ar: 'لا توجد فواتير. اضغط + لإنشاء فاتورة.', fr: 'Aucune facture. Appuyez sur + pour en créer une.', en: 'No invoices. Tap + to create one.' },
  'inv.addFirst':   { ar: 'أضِف عميلاً أولاً قبل إنشاء فاتورة.', fr: 'Ajoutez d’abord un client.', en: 'Add a customer first.' },
  'inv.create':     { ar: 'إنشاء الفاتورة', fr: 'Créer la facture', en: 'Create invoice' },
  'inv.payments':   { ar: 'المدفوعات', fr: 'Paiements', en: 'Payments' },
  'inv.payment':    { ar: 'دفعة', fr: 'Paiement', en: 'Payment' },
  'inv.noPayments': { ar: 'لم تُسجَّل أي دفعة بعد', fr: 'Aucun paiement enregistré', en: 'No payment recorded yet' },
  'inv.savePdf':    { ar: 'حفظ PDF / طباعة', fr: 'PDF / Imprimer', en: 'Save PDF / Print' },
  'inv.copyText':   { ar: 'نسخ كنص (للواتساب)', fr: 'Copier (WhatsApp)', en: 'Copy as text (WhatsApp)' },
  'inv.delConfirm': { ar: 'تأكيد حذف الفاتورة؟', fr: 'Confirmer la suppression de la facture ?', en: 'Delete this invoice?' },
  'inv.delete':     { ar: 'حذف الفاتورة', fr: 'Supprimer la facture', en: 'Delete invoice' },
  'inv.delPayment': { ar: 'حذف هذه الدفعة؟', fr: 'Supprimer ce paiement ?', en: 'Delete this payment?' },

  // ---- doc / items ----
  'doc.items':     { ar: 'العناصر', fr: 'Articles', en: 'Items' },
  'doc.addItem':   { ar: 'إضافة عنصر', fr: 'Ajouter un article', en: 'Add item' },
  'doc.fromCatalog':{ ar: '+ من الخدمات', fr: '+ du catalogue', en: '+ from services' },
  'doc.desc':      { ar: 'الوصف', fr: 'Description', en: 'Description' },
  'doc.descOpt':   { ar: 'الوصف (اختياري)', fr: 'Description (optionnel)', en: 'Description (optional)' },
  'doc.discount':  { ar: 'التخفيض', fr: 'Remise', en: 'Discount' },
  'doc.percent':   { ar: 'نسبة %', fr: 'Pourcentage %', en: 'Percent %' },
  'doc.fixed':     { ar: 'مبلغ ثابت', fr: 'Montant fixe', en: 'Fixed amount' },
  'doc.addTax':    { ar: 'إضافة الضريبة (TVA)', fr: 'Ajouter la TVA', en: 'Add tax (TVA)' },
  'doc.taxRate':   { ar: 'نسبة TVA (%)', fr: 'Taux TVA (%)', en: 'TVA rate (%)' },
  'doc.subtotal':  { ar: 'المجموع الفرعي', fr: 'Sous-total', en: 'Subtotal' },
  'doc.total':     { ar: 'الإجمالي', fr: 'Total', en: 'Total' },
  'doc.tax':       { ar: 'الضريبة', fr: 'TVA', en: 'Tax' },

  // ---- expenses ----
  'exp.total':      { ar: 'المجموع', fr: 'Total', en: 'Total' },
  'exp.tabExpenses':{ ar: 'المصاريف', fr: 'Dépenses', en: 'Expenses' },
  'exp.tabWorkers': { ar: 'العمّال', fr: 'Ouvriers', en: 'Workers' },
  'exp.empty':      { ar: 'لا توجد مصاريف في هذا التصنيف.', fr: 'Aucune dépense dans cette catégorie.', en: 'No expenses in this category.' },
  'exp.customer':   { ar: 'العميل / المشروع', fr: 'Client / Projet', en: 'Customer / Project' },
  'exp.generalOpt': { ar: 'عام (غير مرتبط بعميل)', fr: 'Général (sans client)', en: 'General (no customer)' },
  'exp.type':       { ar: 'النوع', fr: 'Type', en: 'Type' },
  'exp.descPh':     { ar: 'مثال: شراء حديد، نقل…', fr: 'Ex : achat de fer, transport…', en: 'e.g. buy steel, transport…' },
  'exp.receipt':    { ar: 'صورة الوصل (اختياري)', fr: 'Photo du reçu (optionnel)', en: 'Receipt photo (optional)' },
  'exp.removeImg':  { ar: 'إزالة الصورة', fr: 'Retirer la photo', en: 'Remove photo' },
  'exp.save':       { ar: 'حفظ المصروف', fr: 'Enregistrer la dépense', en: 'Save expense' },
  'exp.delConfirm': { ar: 'حذف؟', fr: 'Supprimer ?', en: 'Delete?' },

  // ---- payment ----
  'pay.remaining':  { ar: 'المتبقّي', fr: 'Reste à payer', en: 'Remaining' },
  'pay.method':     { ar: 'طريقة الدفع', fr: 'Mode de paiement', en: 'Payment method' },
  'pay.receivedBy': { ar: 'المستلم (من استلم الدفعة) — اختياري', fr: 'Reçu par (optionnel)', en: 'Received by (optional)' },
  'pay.save':       { ar: 'حفظ الدفعة', fr: 'Enregistrer le paiement', en: 'Save payment' },
  'pay.paidWord':   { ar: 'مدفوع', fr: 'payé', en: 'paid' },
  'pay.remainWord': { ar: 'متبقّي', fr: 'restant', en: 'remaining' },
  'pay.fullyPaid':  { ar: 'مدفوعة بالكامل ✓', fr: 'Payé en totalité ✓', en: 'Fully paid ✓' },

  // ---- workers / labor / timesheet / period ----
  'work.searchPh':   { ar: '🔍 بحث عن عامل…', fr: '🔍 Rechercher un ouvrier…', en: '🔍 Search a worker…' },
  'work.empty':      { ar: 'لا يوجد عمّال. اضغط + لإضافة عامل.', fr: 'Aucun ouvrier. Appuyez sur + pour en ajouter.', en: 'No workers. Tap + to add one.' },
  'work.due':        { ar: 'مستحق', fr: 'dû', en: 'due' },
  'work.name':       { ar: 'اسم العامل', fr: "Nom de l'ouvrier", en: 'Worker name' },
  'work.emergName':  { ar: 'اسم قريب (للطوارئ)', fr: 'Proche (urgence)', en: 'Emergency contact' },
  'work.emergPhone': { ar: 'رقم هاتف احتياطي', fr: 'Téléphone de secours', en: 'Backup phone' },
  'work.idNumber':   { ar: 'رقم بطاقة التعريف', fr: "N° de carte d'identité", en: 'ID card number' },
  'work.type':       { ar: 'نوع العامل', fr: "Type d'ouvrier", en: 'Worker type' },
  'work.dailySalary':{ ar: 'الراتب اليومي (دج)', fr: 'Salaire journalier (DA)', en: 'Daily salary (DA)' },
  'work.dailyHours': { ar: 'ساعات العمل اليومية', fr: 'Heures par jour', en: 'Daily hours' },
  'work.defaultRate':{ ar: 'سعر الوحدة الافتراضي (اختياري)', fr: 'Prix unitaire par défaut (optionnel)', en: 'Default unit price (optional)' },
  'work.addWorker':  { ar: 'إضافة العامل', fr: "Ajouter l'ouvrier", en: 'Add worker' },
  'work.delConfirm': { ar: 'حذف العامل وكل سجلّاته؟', fr: "Supprimer l'ouvrier et son historique ?", en: 'Delete worker and all records?' },
  'work.delWorker':  { ar: 'حذف العامل', fr: "Supprimer l'ouvrier", en: 'Delete worker' },
  'work.dailyLabel': { ar: 'الراتب اليومي:', fr: 'Salaire/jour :', en: 'Daily salary:' },
  'work.perDay':     { ar: 'سا/يوم', fr: 'h/j', en: 'h/day' },
  'work.unpaidDue':  { ar: 'مستحق غير مدفوع', fr: 'Dû non payé', en: 'Unpaid due' },
  'work.unpaidHours':{ ar: 'ساعات غير مدفوعة', fr: 'Heures non payées', en: 'Unpaid hours' },
  'work.logDay':     { ar: 'تسجيل يوم', fr: 'Saisir un jour', en: 'Log a day' },
  'work.payPeriod':  { ar: 'دفع فترة', fr: 'Payer une période', en: 'Pay a period' },
  'work.dayLog':     { ar: 'سجل الأيام', fr: 'Journal des jours', en: 'Day log' },
  'work.noDays':     { ar: 'لا توجد أيام مسجّلة بعد', fr: 'Aucun jour enregistré', en: 'No days logged yet' },
  'work.paidBadge':  { ar: 'مدفوعة', fr: 'Payé', en: 'Paid' },
  'work.dues':       { ar: 'المستحقات', fr: 'Dûs', en: 'Dues' },
  'work.addDue':     { ar: 'إضافة مستحق', fr: 'Ajouter un dû', en: 'Add due' },
  'work.noDues':     { ar: 'لا توجد مستحقات بعد', fr: 'Aucun dû pour le moment', en: 'No dues yet' },
  'work.payFull':    { ar: 'مدفوع بالكامل', fr: 'Payer en totalité', en: 'Mark fully paid' },
  'work.delDay':     { ar: 'حذف هذا اليوم؟', fr: 'Supprimer ce jour ?', en: 'Delete this day?' },
  'work.delPayment': { ar: 'حذف هذه الدفعة؟', fr: 'Supprimer ce paiement ?', en: 'Delete this payment?' },
  'work.delDue':     { ar: 'حذف هذا المستحق؟', fr: 'Supprimer ce dû ?', en: 'Delete this due?' },
  'work.project':    { ar: 'المشروع / الزبون', fr: 'Projet / Client', en: 'Project / Customer' },
  'work.generalOpt': { ar: 'عام (غير مرتبط بزبون)', fr: 'Général (sans client)', en: 'General (no customer)' },
  'work.calcMethod': { ar: 'طريقة الحساب', fr: 'Méthode de calcul', en: 'Basis' },
  'work.basisAmount':{ ar: 'مبلغ ثابت', fr: 'Montant fixe', en: 'Fixed amount' },
  'work.basisMeasured':{ ar: 'بالأمتار / بنود', fr: 'Au métrage / articles', en: 'By meters / items' },
  'work.dueAmount':  { ar: 'المبلغ المستحق', fr: 'Montant dû', en: 'Amount due' },
  'work.items':      { ar: 'البنود', fr: 'Articles', en: 'Items' },
  'work.addLine':    { ar: 'إضافة بند', fr: 'Ajouter une ligne', en: 'Add line' },
  'work.due2':       { ar: 'المستحق', fr: 'Dû', en: 'Due' },
  'work.saveDue':    { ar: 'حفظ المستحق', fr: 'Enregistrer le dû', en: 'Save due' },
  'work.overtime':   { ar: 'ساعات إضافية', fr: 'Heures supp.', en: 'Overtime hours' },
  'work.overtimeOpt':{ ar: 'ساعات إضافية (اختياري)', fr: 'Heures supp. (optionnel)', en: 'Overtime hours (optional)' },
  'work.dayHours':   { ar: 'ساعات اليوم', fr: 'Heures du jour', en: 'Day hours' },
  'work.saveDay':    { ar: 'حفظ اليوم', fr: 'Enregistrer le jour', en: 'Save day' },
  'work.regularHours':{ ar: 'ساعات عادية', fr: 'Heures normales', en: 'Regular hours' },
  'work.unpaidDays': { ar: 'أيام غير مدفوعة', fr: 'Jours non payés', en: 'Unpaid days' },
  'work.periodAmount':{ ar: 'المبلغ المستحق', fr: 'Montant à payer', en: 'Amount due' },
  'work.recordPay':  { ar: 'تسجيل الدفع', fr: 'Enregistrer le paiement', en: 'Record payment' },
  'work.paidAmount': { ar: 'المبلغ المدفوع', fr: 'Montant payé', en: 'Amount paid' },
  'work.remainWorker':{ ar: 'المتبقّي للعامل', fr: 'Reste dû à l’ouvrier', en: 'Remaining to worker' },

  // ---- settings ----
  'set.business':    { ar: 'اسم الورشة / المشروع', fr: 'Nom de l’atelier / projet', en: 'Business / project name' },
  'set.owner':       { ar: 'الاسم الشخصي (اختياري)', fr: 'Nom personnel (optionnel)', en: 'Owner name (optional)' },
  'set.phoneOpt':    { ar: 'رقم الهاتف (اختياري)', fr: 'Téléphone (optionnel)', en: 'Phone (optional)' },
  'set.taxRate':     { ar: 'نسبة الضريبة الافتراضية TVA (%)', fr: 'Taux TVA par défaut (%)', en: 'Default TVA rate (%)' },
  'set.logo':        { ar: 'شعار الورشة (يظهر على الفاتورة والعرض)', fr: 'Logo (sur factures et devis)', en: 'Business logo (on invoices/quotes)' },
  'set.removeLogo':  { ar: 'إزالة الشعار', fr: 'Retirer le logo', en: 'Remove logo' },
  'set.pickLogo':    { ar: 'اختيار شعار', fr: 'Choisir un logo', en: 'Choose logo' },
  'set.theme':       { ar: 'المظهر', fr: 'Apparence', en: 'Appearance' },
  'set.themeSystem': { ar: 'حسب النظام', fr: 'Système', en: 'System' },
  'set.themeLight':  { ar: 'فاتح', fr: 'Clair', en: 'Light' },
  'set.themeDark':   { ar: 'داكن', fr: 'Sombre', en: 'Dark' },
  'set.language':    { ar: 'اللغة', fr: 'Langue', en: 'Language' },
  'set.footer':      { ar: 'نص أسفل الفاتورة (يظهر فوق الملاحظات)', fr: 'Texte en bas de facture', en: 'Invoice footer text' },
  'set.footerPh':    { ar: 'مثال: شروط الدفع، معلومات الحساب البنكي…', fr: 'Ex : conditions de paiement, RIB…', en: 'e.g. payment terms, bank details…' },
  'set.services':    { ar: 'قائمة الخدمات', fr: 'Catalogue de services', en: 'Services catalog' },
  'set.servicesHint':{ ar: 'خدمات جاهزة بأسعارها، تختارها بسرعة عند إنشاء عرض أو فاتورة.', fr: 'Services préenregistrés à insérer rapidement dans un devis/facture.', en: 'Preset priced services to quickly add to a quote/invoice.' },
  'set.serviceName': { ar: 'اسم الخدمة', fr: 'Nom du service', en: 'Service name' },
  'set.price':       { ar: 'السعر', fr: 'Prix', en: 'Price' },
  'set.delService':  { ar: 'حذف هذه الخدمة؟', fr: 'Supprimer ce service ?', en: 'Delete this service?' },
  'set.dataSection': { ar: 'النسخة الاحتياطية والبيانات', fr: 'Sauvegarde et données', en: 'Backup & data' },
  'set.privacy':     { ar: 'بياناتك مخزّنة على هذا الجهاز فقط ولا تُرسل لأي خادم. احتفظ بنسخة احتياطية بانتظام حتى لا تفقدها.', fr: 'Vos données restent sur cet appareil et ne sont envoyées à aucun serveur. Sauvegardez régulièrement.', en: 'Your data stays on this device and is never sent to any server. Back up regularly.' },
  'set.copyBackup':  { ar: 'نسخ نسخة احتياطية كاملة', fr: 'Copier une sauvegarde complète', en: 'Copy full backup' },
  'set.copiedBackup':{ ar: 'تم نسخ النسخة الاحتياطية ✓', fr: 'Sauvegarde copiée ✓', en: 'Backup copied ✓' },
  'set.lastBackup':  { ar: 'آخر نسخة احتياطية: {d}', fr: 'Dernière sauvegarde : {d}', en: 'Last backup: {d}' },
  'set.noBackup':    { ar: 'لم تأخذ أي نسخة احتياطية بعد.', fr: 'Aucune sauvegarde effectuée.', en: 'No backup taken yet.' },
  'set.restore':     { ar: 'استرجاع نسخة احتياطية', fr: 'Restaurer une sauvegarde', en: 'Restore a backup' },
  'set.restorePh':   { ar: 'ألصق هنا النص المنسوخ سابقاً', fr: 'Collez ici le texte copié', en: 'Paste the copied text here' },
  'set.restoreBtn':  { ar: 'استرجاع', fr: 'Restaurer', en: 'Restore' },
  'set.restoreOk':   { ar: 'تم الاسترجاع ✓', fr: 'Restauré ✓', en: 'Restored ✓' },
  'set.restoreBad':  { ar: 'النص غير صالح، تأكد من نسخه كاملاً', fr: 'Texte invalide, vérifiez la copie', en: 'Invalid text, check the full copy' },
  'set.loadDemo':    { ar: 'تحميل بيانات تجريبية', fr: 'Charger des données de démo', en: 'Load demo data' },
  'set.clearAll':    { ar: 'حذف كل البيانات', fr: 'Effacer toutes les données', en: 'Delete all data' },
  'set.clearConfirm':{ ar: 'حذف كل البيانات نهائياً؟', fr: 'Effacer définitivement toutes les données ?', en: 'Permanently delete all data?' },

  // ---- reference labels ----
  'cstatus.new':         { ar: 'جديد', fr: 'Nouveau', en: 'New' },
  'cstatus.site_visit':  { ar: 'زيارة موقع', fr: 'Visite', en: 'Site visit' },
  'cstatus.quote_sent':  { ar: 'عرض مُرسل', fr: 'Devis envoyé', en: 'Quote sent' },
  'cstatus.approved':    { ar: 'مقبول', fr: 'Approuvé', en: 'Approved' },
  'cstatus.in_progress': { ar: 'قيد التنفيذ', fr: 'En cours', en: 'In progress' },
  'cstatus.completed':   { ar: 'مكتمل', fr: 'Terminé', en: 'Completed' },

  'qstatus.draft':    { ar: 'مسودة', fr: 'Brouillon', en: 'Draft' },
  'qstatus.sent':     { ar: 'مُرسل', fr: 'Envoyé', en: 'Sent' },
  'qstatus.accepted': { ar: 'مقبول', fr: 'Accepté', en: 'Accepted' },
  'qstatus.rejected': { ar: 'مرفوض', fr: 'Refusé', en: 'Rejected' },

  'istatus.unpaid':  { ar: 'غير مدفوعة', fr: 'Impayée', en: 'Unpaid' },
  'istatus.partial': { ar: 'مدفوعة جزئياً', fr: 'Partielle', en: 'Partial' },
  'istatus.paid':    { ar: 'مدفوعة', fr: 'Payée', en: 'Paid' },

  'ecat.materials': { ar: 'مواد', fr: 'Matériaux', en: 'Materials' },
  'ecat.labor':     { ar: 'يد عاملة', fr: "Main d'œuvre", en: 'Labor' },
  'ecat.food':      { ar: 'طعام', fr: 'Nourriture', en: 'Food' },
  'ecat.fuel':      { ar: 'وقود', fr: 'Carburant', en: 'Fuel' },
  'ecat.transport': { ar: 'نقل', fr: 'Transport', en: 'Transport' },
  'ecat.tools':     { ar: 'أدوات ومعدات', fr: 'Outils & équipement', en: 'Tools & equipment' },
  'ecat.other':     { ar: 'أخرى', fr: 'Autres', en: 'Other' },

  'wtype.project': { ar: 'بالمشروع', fr: 'Au projet', en: 'Per project' },
  'wtype.monthly': { ar: 'شهري (راتب)', fr: 'Mensuel (salaire)', en: 'Monthly (salary)' },
};

export const LangContext = createContext('ar');

function translate(lang, key, vars) {
  const entry = DICT[key];
  let s = entry ? (entry[lang] ?? entry.ar) : key;
  if (vars) for (const k in vars) s = s.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
  return s;
}

// Standalone translate for use outside React hooks (e.g. building the top-bar title).
export function t(lang, key, vars) {
  return translate(lang, key, vars);
}

// useT() returns a t(key, vars?) bound to the active language.
export function useT() {
  const lang = useContext(LangContext);
  return (key, vars) => translate(lang, key, vars);
}

export function useLang() {
  return useContext(LangContext);
}
