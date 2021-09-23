"use strict";
window.addEventListener("DOMContentLoaded", start);

const StudentPro = {
  firstName: "",
  middleName: "",
  lastName: "",
  nickName: "",
  gender: "",
  house: "",
};

const allStudents = [];

function start() {
  loadJSON();
  document.querySelectorAll("[data-action='filter']").forEach((p) => p.addEventListener("click", filterClicked));
  document.querySelectorAll("[data-action='sort']").forEach((p) => p.addEventListener("click", sortClicked));
  document.querySelectorAll("button").forEach((button) =>
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      button.nextElementSibling.classList.toggle("hidden");
      window.addEventListener("click", (e) => {
        button.nextElementSibling.classList.add("hidden");
      });
    })
  );
}

function loadJSON() {
  fetch("https://petlatkea.dk/2021/hogwarts/students.json")
    .then((res) => res.json())
    .then((data) => {
      prepareStudents(data);
      console.log(data);
    });
}

// Creating new array with cleaned data

function prepareStudents(data) {
  data.forEach((obj) => {
    const studentPro = Object.create(StudentPro);

    // Dividing fullname into parts

    const fullName = obj.fullname.trim();
    const gender = obj.gender;
    const house = capitalize(obj.house.trim());

    let firstName = capitalize(fullName.substring(0, fullName.indexOf(" ")));
    let middleName = capitalize(fullName.substring(fullName.indexOf(" ") + 1, fullName.lastIndexOf(" ")));
    let lastName = capitalize(fullName.substring(fullName.lastIndexOf(" ") + 1));
    let nickName = "";

    // Fixing unusual situations: Leanne, Ernie, Finch-Fletchley

    if (fullName.includes(" ") === false) {
      firstName = capitalize(fullName.substring(0));
      lastName = "";
    }
    if (middleName.includes('"')) {
      nickName = capitalize(middleName.substring(1, middleName.length - 1));
      middleName = "";
    }
    if (lastName.includes("-")) {
      lastName = lastName.split("-")[0] + "-" + capitalize(lastName.split("-")[1]);
    }

    // Populating created object with data

    studentPro.firstName = firstName;
    studentPro.middleName = middleName;
    studentPro.nickName = nickName;
    studentPro.lastName = lastName;
    studentPro.gender = gender;
    studentPro.house = house;
    allStudents.push(studentPro);
  });
  showAllStudents(allStudents);
}

function capitalize(str) {
  const capStr = str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
  return capStr;
}

// Filtering

function filterClicked(event) {
  const filter = event.target.dataset.filter;
  document.querySelector("#filter span").textContent = filter;
  filterStudents(filter);
}

function filterStudents(filter) {
  let filteredStudents = allStudents.filter(filtered);
  function filtered(student) {
    if (student.house === filter) {
      return true;
    } else if (filter === "All houses") {
      return true;
    } else {
      return false;
    }
  }
  showAllStudents(filteredStudents);
}

// Sorting

function sortClicked(event) {
  const sort = event.target.dataset.sort;
  // Use camelCase for hyphens in data attributes. sort-direction = sortDirection
  const sortDirection = event.target.dataset.sortDirection;
  if (sortDirection === "asc") {
    event.target.dataset.sortDirection = "desc";
    document.querySelector("#sort span").textContent = `${capitalize(sort)} ( A - Z )`;
  } else {
    event.target.dataset.sortDirection = "asc";
    document.querySelector("#sort span").textContent = `${capitalize(sort)} ( Z - A )`;
  }
  console.log(`User selected ${sort}`);
  sortStudents(sort, sortDirection);
}

function sortStudents(sort, sortDirection) {
  let direction = 1;
  if (sortDirection === "desc") {
    direction = -1;
  }
  let sortedStudents = allStudents.sort(sorted);
  function sorted(a, b) {
    if (a[sort] < b[sort]) {
      return -1 * direction;
    } else {
      return 1 * direction;
    }
  }
  showAllStudents(sortedStudents);
}

function showAllStudents(all) {
  document.querySelector("#studentList").innerHTML = "";
  all.forEach(displayStudentList);
}

function displayStudentList(student) {
  const clone = document.querySelector("#studentTemplate").content.cloneNode(true);
  if (student.firstName === "Leanne") {
    clone.querySelector(".studentPhoto").src = `images/empty.png`;
  } else if (student.lastName === "Patil") {
    clone.querySelector(".studentPhoto").src = `images/${student.lastName.toLowerCase()}_${student.firstName.toLowerCase()}.png`;
  } else if (student.lastName.includes("-")) {
    clone.querySelector(".studentPhoto").src = `images/${student.lastName.split("-")[1].toLowerCase()}_${student.firstName
      .substring(0, 1)
      .toLowerCase()}.png`;
  } else {
    clone.querySelector(".studentPhoto").src = `images/${student.lastName.toLowerCase()}_${student.firstName
      .substring(0, 1)
      .toLowerCase()}.png`;
  }
  clone.querySelector(
    "[data-field=firstname]"
  ).textContent = `${student.firstName} ${student.middleName} ${student.nickName} ${student.lastName}`;
  clone.querySelector("[data-field=house]").textContent = student.house;
  document.querySelector("#studentList").appendChild(clone);
}
