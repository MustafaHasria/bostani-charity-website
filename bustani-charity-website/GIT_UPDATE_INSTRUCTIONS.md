# تعليمات تحديث المشروع على GitHub

## رابط الـ Repository:
https://github.com/MustafaHasria/bostani-charity-website/tree/main/bustani-charity-website

---

## الخطوات المطلوبة لتحديث المشروع:

### 1. فتح Terminal (PowerShell أو CMD) في مجلد المشروع:
```powershell
cd "C:\Users\dell\Desktop\New folder\bustani-charity-website"
```

### 2. التحقق من حالة المشروع:
```powershell
git status
```

### 3. عرض التغييرات المعدلة:
```powershell
git diff
```

### 4. إضافة جميع التغييرات:
```powershell
git add .
```
أو لإضافة ملفات محددة:
```powershell
git add src/components/Hero/Hero.css
git add src/App.css
```

### 5. التحقق من الملفات المضافة:
```powershell
git status
```

### 6. إنشاء Commit (حفظ التغييرات):
```powershell
git commit -m "fix: إصلاح z-index للـ Hero section و Navbar dropdowns"
```

**ملاحظة:** يمكنك تغيير رسالة الـ commit حسب التغييرات التي قمت بها.

### 7. سحب التغييرات من الـ Repository (إن وجدت):
```powershell
git pull origin main
```

### 8. رفع التغييرات إلى GitHub:
```powershell
git push origin main
```

---

## في حالة وجود مشاكل:

### إذا كان هناك تغييرات على الـ Repository غير موجودة محلياً:
```powershell
git pull origin main --rebase
git push origin main
```

### إذا رفض Git الـ push:
```powershell
git pull origin main
git push origin main
```

### للتحقق من الـ Remote المتصل:
```powershell
git remote -v
```

### لتغيير الـ Remote (إذا لزم الأمر):
```powershell
git remote set-url origin https://github.com/MustafaHasria/bostani-charity-website.git
```

---

## أوامر إضافية مفيدة:

### عرض سجل الـ Commits:
```powershell
git log --oneline -10
```

### عرض الفرق بين نسختك المحلية و GitHub:
```powershell
git diff origin/main
```

### إلغاء التغييرات في ملف محدد (قبل الـ add):
```powershell
git restore <اسم_الملف>
```

### إلغاء جميع التغييرات غير المحفوظة:
```powershell
git restore .
```

---

## مثال كامل لتحديث المشروع:

```powershell
# 1. الانتقال إلى مجلد المشروع
cd "C:\Users\dell\Desktop\New folder\bustani-charity-website"

# 2. التحقق من التغييرات
git status

# 3. إضافة جميع التغييرات
git add .

# 4. إنشاء Commit
git commit -m "Update: إصلاح Hero section visibility"

# 5. سحب التغييرات من GitHub
git pull origin main

# 6. رفع التغييرات
git push origin main
```

---

## رسائل Commit مقترحة:

- `fix: إصلاح مشكلة z-index للـ Hero section`
- `feat: إضافة animations للـ theme toggle`
- `style: تحديث تصميم Navbar dropdowns`
- `fix: إصلاح ظهور Hero section بعد التعديلات`

---

**ملاحظة:** تأكد من أن لديك صلاحيات الكتابة على الـ Repository قبل محاولة الـ push.

