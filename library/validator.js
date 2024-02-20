/**
 * How to use?
 * - Invoke Validation function, parameter is an obj
 * Key must have:
 * - form: Selector of main form element should be id
 * - formGroupSelector: Selector of form group element, should be class
 * - errorMessageSelector: Selector of error message element, should be class
 * - rules: A list of rule you want to validate, declare as an array
 * Rules that you can apply to your form:
 * - isRequired
 * - isEmail
 * - minLength
 * - isConfirmed
 * Parameters:
 * 1. All of rules will be receive first param is the selector of that field need to validate,
 * and last param is the message error you want to customize.
 * 2. Exception:
 * - minLength 2th parameter is min of character you want user enter
 * - isConfirmed 2th parameter is callback return value you want user enter the same.
 *    Example declare a rule:
 *      Validation.isRequired(selector, message)
 * Notice:
 * - One input can have more than one rule.
 * - You can receive data user entered in onSubmit method, try declare onSubmit,
 * receive param as `data` and console.log(data)
 */

function Validator(option) {
  // Hàm tìm thẻ cha (form group) của input element
  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }

  // Object chứa rules với selector tương ứng
  let selectorRules = {};

  // Hàm thực hiện validate giá trị
  function validate(inputNode, _rule) {
    // Thẻ cha chứa input và message element
    const formGroup = getParent(inputNode, option.formGroupSelector);

    // Error element cùng thẻ cha với input element
    const errorNode = formGroup.querySelector(option.errorMessageSelector);

    // Giá trị của `errorMsg` sẽ là message nếu có lỗi || undefined nếu hợp lệ
    let errorMsg;

    // Lấy ra các rule
    let rules = selectorRules[_rule.selector];

    // Lặp qua rules & kiểm tra lỗi
    for (let rule of rules) {
      switch (inputNode.type) {
        case "checkbox":
        case "radio":
          errorMsg = rule(formNode.querySelector(_rule.selector + ":checked"));
          break;

        default:
          errorMsg = rule(inputNode.value);
      }
      // nếu có lỗi dừng việc kiểm tra
      if (errorMsg) break;
    }

    // Nếu có message lỗi, hiển thị lỗi
    if (errorMsg) {
      errorNode.innerText = errorMsg;
      formGroup.classList.add("invalid");
    } else {
      errorNode.innerText = "";
      formGroup.classList.remove("invalid");
    }

    return !errorMsg;
  }

  // Form cần validation
  const formNode = document.querySelector(option.form);

  if (formNode) {
    // Khi submit form
    formNode.onsubmit = function (e) {
      e.preventDefault();

      // Mặc định form valid sẽ bằng true
      let isFormValid = true;

      // Lặp và thực hiện validate tất cả field dữ liệu
      // gán lại kết quả boolean cho form valid
      option.rules.forEach((rule) => {
        const inputNode = formNode.querySelector(rule.selector);
        const isValid = validate(inputNode, rule);
        isFormValid = isValid;
      });

      //  Nếu all fields không có lỗi
      if (isFormValid) {
        // Trường hợp submit với JavaScript
        if (typeof option.onSubmit === "function") {
          // Lấy ra tất cả enables input
          const enableInputs = formNode.querySelectorAll(
            "[name]:not([disabled])"
          );

          // Chuyển nodeList thành array, hợp nhất thành một object data người dùng nhập
          // với key là name của input và value là value từ user nhập vào
          const data = Array.from(enableInputs).reduce((values, input) => {
            const inputName = input.name;
            switch (input.type) {
              case "checkbox":
                // Chuyển kiểu giá trị của loại checkbox thành array
                if (!Array.isArray(values[inputName])) {
                  values[inputName] = [];
                }

                // Push ô được check vào mảng
                if (input.matches(":checked")) {
                  values[inputName].push(input.value);
                  // return values;
                }

                // Nếu không ô nào được check thì gán bằng chuỗi rỗng
                if (
                  Array.isArray(values[inputName]) &&
                  values[inputName].length === 0
                ) {
                  values[inputName] = "";
                }
                break;
              case "radio":
                // Lặp qua và kiểm tra ô được check và gán value
                values[input.name] = formNode.querySelector(
                  `input[name='${input.name}']:checked`
                ).value;
                break;
              case "file":
                // Gán bằng object chứa link của file
                values[inputName] = input.files;
                break;
              default:
                // Value của ô input người dùng nhập văn bản nói chung
                values[inputName] = input.value;
            }
            return values;
          }, {});

          option.onSubmit(data);
        }
        // Trường hợp submit với hành vi mặc định
        else {
          formNode.submit();
        }
      }
    };

    // Lặp qua các rule của hàm tạo & xử lý sự kiện của input
    option.rules.forEach((rule) => {
      // Lấy ra danh sách input element
      const inputNodes = formNode.querySelectorAll(rule.selector);

      // Thêm rule với selector tương ứng vào object `selectorRule`
      // giá trị của các selector sẽ là một mảng chứa các rule
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }

      // Chuyển nodeList của input element thành array và lặp qua
      Array.from(inputNodes).forEach(function (inputNode) {
        // Tìm element cha là form group
        const formGroup = getParent(inputNode, option.formGroupSelector);
        // Từ thẻ cha, tìm ra error element cùng cấp
        const errorNode = formGroup.querySelector(option.errorMessageSelector);

        // Xử lý khi blur khỏi input
        inputNode.onblur = function () {
          validate(inputNode, rule);
        };

        // Khi user bắt đầu nhập, gỡ lỗi
        inputNode.oninput = function () {
          errorNode.innerText = "";
          formGroup.classList.remove("invalid");
        };
      });
    });
  }
}

// định nghĩa các rule

// Bắt buộc nhập
Validator.isRequired = function (selector, message) {
  return {
    selector,
    test(value) {
      return value ? undefined : message || "Vui lòng nhập trường này.";
    },
  };
};

// Field value nhập vào phải là email
Validator.isEmail = function (selector, message) {
  return {
    selector,
    test(value) {
      const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regexEmail.test(value)
        ? undefined
        : message || "Trường này phải là email.";
    },
  };
};

// Yêu cầu kí tự nhập tối thiểu
Validator.minLength = function (selector, min, message) {
  return {
    selector,
    test(value) {
      return value.length >= min
        ? undefined
        : message || `Vui lòng nhập tối thiểu ${min} kí tự`;
    },
  };
};

// Giá trị nhập vào phải bằng với giá trị field cần confirm
Validator.isConfirmed = function (selector, confirmValue, message) {
  return {
    selector,
    test(value) {
      return value === confirmValue()
        ? undefined
        : message || "Giá trị nhập vào không chính xác";
    },
  };
};
