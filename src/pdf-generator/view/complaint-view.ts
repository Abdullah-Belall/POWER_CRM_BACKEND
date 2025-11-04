export const complaintView = (data: any) => {
  //   <div class="flex flex-col sm:flex-row gap-3">
  //   <label class="flex flex-col text-sm w-full sm:w-1/2">
  //     <span class="text-gray-700">الشركة</span>
  //     <input
  //       type="text"
  //       class="bg-[#378600] text-white rounded-md py-2 px-3"
  //       value=${data?.client?.user_name}
  //       disabled
  //     />
  //   </label>
  // </div>
  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>عرض الشكوى</title>

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap"
      rel="stylesheet"
    />

    <script src="https://cdn.tailwindcss.com"></script>

    <style>
      * {
        font-family: "Cairo", sans-serif;
      }
      ::-webkit-scrollbar {
        width: 6px;
      }
      ::-webkit-scrollbar-thumb {
        background-color: #378600;
        border-radius: 10px;
      }
    </style>
  </head>

  <body class="bg-gray-50 text-right min-h-screen p-6">
    <div class="w-full bg-white p-6 rounded-none shadow-none">
      <h1 class="text-2xl font-semibold text-black mb-6 text-center">شكوى رقم ${data.index}</h1>

      <div class="w-full overflow-x-hidden space-y-4">
        <div class="flex flex-col gap-3">

          <div class="flex flex-col sm:flex-row gap-3">
            <label class="flex flex-col text-sm w-full sm:w-1/2">
              <span class="text-gray-700">مقدم الشكوى</span>
              <input
                type="text"
                class="bg-[#378600] text-white rounded-md py-2 px-3"
                value=${data.full_name}
                disabled
              />
            </label>

            <label class="flex flex-col text-sm w-full sm:w-1/2">
              <span class="text-gray-700">رقم الهاتف</span>
              <input
                type="text"
                class="bg-[#378600] text-white rounded-md py-2 px-3"
                value=${data.phone}
                disabled
              />
            </label>
          </div>

          <label class="flex flex-col text-sm">
            <span class="text-gray-700">موضوع الشكوى</span>
            <input
              type="text"
              class="bg-[#378600] text-white rounded-md py-2 px-3"
              value=${data.title}
              disabled
            />
          </label>

          <label class="flex flex-col text-sm">
            <span class="text-gray-700">تفاصيل الشكوى</span>
            <textarea rows="3" class="bg-[#378600] text-white rounded-md py-2 px-3" disabled>
            ${data.details}
            </textarea
            >
          </label>

          <div class="flex flex-col sm:flex-row gap-3">
            <label class="flex flex-col text-sm w-full sm:w-1/2">
              <span class="text-gray-700">مشارك الشاشة</span>
              <input
                type="text"
                class="bg-[#378600] text-white rounded-md py-2 px-3"
                value=${data.screen_viewer}
                disabled
              />
            </label>

            <label class="flex flex-col text-sm w-full sm:w-1/2">
              <span class="text-gray-700">معرف المشاهد</span>
              <input
                type="text"
                class="bg-[#378600] text-white rounded-md py-2 px-3"
                value=${data.screen_viewer_id}
                disabled
              />
            </label>
          </div>
        </div>

        <div class="border-t border-gray-200 pt-4 flex flex-col items-center gap-3">
          <h1 class="text-black font-semibold text-lg">تفاصيل الحالة</h1>

          <label class="flex flex-col w-full sm:w-1/2 text-sm">
            <span class="text-gray-700">حالة الأولوية</span>
            <select
              class="border border-gray-300 rounded-md py-2 px-3 text-gray-700 bg-white"
              disabled
            >
              <option>مرتفعة</option>
              <option selected>${data.priority_status}</option>
              <option>منخفضة</option>
            </select>
          </label>

          <label class="flex flex-col w-full sm:w-1/2 text-sm">
            <span class="text-gray-700">حالة الشكوى</span>
            <select
              class="border border-gray-300 rounded-md py-2 px-3 text-gray-700 bg-white"
              disabled
            >
              <option selected>${data.status}</option>
              <option>مكتملة</option>
              <option>ملغاة</option>
            </select>
          </label>
        </div>
      </div>
    </div>

    <script src="https://kit.fontawesome.com/e13726c6ea.js" crossorigin="anonymous"></script>
  </body>
</html>

    `;
};
const graphNumbers = [
  {
    max: 500,
    cut: 100,
  },
  {
    max: 1000,
    cut: 200,
  },
  {
    max: 2000,
    cut: 400,
  },
  {
    max: 3000,
    cut: 600,
  },
  {
    max: 4000,
    cut: 800,
  },
  {
    max: 5000,
    cut: 1000,
  },
  {
    max: 6000,
    cut: 1200,
  },
  {
    max: 7000,
    cut: 1400,
  },
  {
    max: 8000,
    cut: 1600,
  },
  {
    max: 9000,
    cut: 1800,
  },
  {
    max: 10000,
    cut: 2000,
  },
  {
    max: 11000,
    cut: 2200,
  },
  {
    max: 12000,
    cut: 2400,
  },
  {
    max: 13000,
    cut: 2600,
  },
  {
    max: 14000,
    cut: 2800,
  },
  {
    max: 15000,
    cut: 3000,
  },
  {
    max: 16000,
    cut: 3200,
  },
  {
    max: 17000,
    cut: 3400,
  },
  {
    max: 18000,
    cut: 3600,
  },
  {
    max: 19000,
    cut: 3800,
  },
  {
    max: 20000,
    cut: 4000,
  },
];
