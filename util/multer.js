const multer = require('multer');

// Server ပေါ်မှာ ယာယီသိမ်းဆည်းမယ့် လမ်းကြောင်း
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 'uploads/' ဆိုတဲ့ folder ထဲမှာ သိမ်းမယ်
    cb(null, 'uploads/');
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