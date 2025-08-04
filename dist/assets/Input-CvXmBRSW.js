import{j as s}from"./index-D_0a8VZH.js";const i=({label:t,error:e,type:a="text",placeholder:l,value:o,onChange:n,required:c=!1,disabled:r=!1,className:u="",...d})=>{const x=`
    w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    ${e?"border-red-500":"border-gray-300"}
    ${r?"bg-gray-100 cursor-not-allowed":"bg-white"}
    ${u}
  `;return s.jsxs("div",{className:"space-y-1",children:[t&&s.jsxs("label",{className:"block text-sm font-medium text-gray-700",children:[t,c&&s.jsx("span",{className:"text-red-500 ml-1",children:"*"})]}),s.jsx("input",{type:a,value:o,onChange:n,placeholder:l,disabled:r,className:x,...d}),e&&s.jsx("p",{className:"text-sm text-red-600",children:e})]})};export{i as I};
