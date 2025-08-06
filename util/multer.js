const multer = require('multer');
const path=require('path');
const fs=require('fs');
// Server ပေါ်မှာ ယာယီသိမ်းဆည်းမယ့် လမ်းကြောင်း
const storage = multer.diskStorage({
   destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads'); // uploads folder ရဲ့ path ကို မှန်မှန်ကန်ကန်ယူ
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // originalname ကို တိုက်ရိုက်မသုံးဘဲ unique နာမည်တစ်ခု ပေးဖို့ လိုအပ်နိုင်ပါတယ်
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 50 // 50MB အထိပဲ လက်ခံမယ်လို့ ကန့်သတ်ထားတာ
  }
});

module.exports = upload;