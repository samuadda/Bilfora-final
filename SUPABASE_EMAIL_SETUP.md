# إعدادات Supabase للبريد الإلكتروني

## المشكلة
عند تغيير البريد الإلكتروني، لا يتم إرسال رابط التأكيد تلقائياً.

## الحل: التحقق من إعدادات Supabase

### 1. تفعيل تأكيد البريد الإلكتروني
1. اذهب إلى [Supabase Dashboard](https://app.supabase.com)
2. اختر مشروعك
3. اذهب إلى **Authentication** → **Settings**
4. في قسم **Email Auth**:
   - تأكد من تفعيل **"Enable email confirmations"**
   - تأكد من تفعيل **"Enable email change confirmations"**

### 2. إعدادات SMTP (اختياري - للتطوير)
إذا كنت تستخدم SMTP مخصص:
1. اذهب إلى **Authentication** → **Email Templates**
2. تأكد من أن قالب **"Change Email Address"** مفعّل
3. تحقق من أن عنوان المرسل (From) مضبوط بشكل صحيح

### 3. إعدادات Site URL
1. اذهب إلى **Authentication** → **URL Configuration**
2. تأكد من أن **Site URL** مضبوط على:
   ```
   http://localhost:3000 (للتطوير)
   أو
   https://yourdomain.com (للإنتاج)
   ```
3. أضف **Redirect URLs**:
   ```
   http://localhost:3000/dashboard/profile
   https://yourdomain.com/dashboard/profile
   ```

### 4. التحقق من إعدادات Email Provider
1. اذهب إلى **Authentication** → **Providers**
2. تأكد من تفعيل **Email** provider
3. تحقق من إعدادات **Email Templates**

### 5. اختبار الإعدادات
بعد تطبيق الإعدادات:
1. جرب تغيير البريد الإلكتروني من صفحة الملف الشخصي
2. تحقق من البريد الوارد (والبريد العشوائي)
3. إذا لم يصل البريد:
   - تحقق من سجلات Supabase (Logs)
   - تحقق من إعدادات SMTP إذا كنت تستخدم مزود مخصص
   - تأكد من أن البريد الإلكتروني ليس في القائمة السوداء

### 6. ملاحظات مهمة
- Supabase يرسل بريد التأكيد تلقائياً عند استدعاء `updateUser({ email })`
- البريد قد يصل بعد بضع دقائق
- تأكد من التحقق من مجلد البريد العشوائي
- في بيئة التطوير، قد تحتاج إلى استخدام Supabase CLI أو إعداد SMTP مخصص

### 7. إذا استمرت المشكلة
1. تحقق من سجلات Supabase (Project Settings → Logs)
2. تأكد من أن `emailRedirectTo` مضبوط بشكل صحيح في الكود
3. جرب استخدام Supabase CLI للاختبار المحلي
4. راجع [وثائق Supabase](https://supabase.com/docs/guides/auth/email-templates)

## الكود الحالي
الكود يستخدم:
```typescript
await supabase.auth.updateUser(
    { email: newEmail },
    { emailRedirectTo: redirectUrl }
);
```

هذا يجب أن يرسل بريد التأكيد تلقائياً إذا كانت الإعدادات صحيحة.

