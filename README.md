## 🚀 Live Demo
🔗 **[View Live](https://restaurant-tab-system.vercel.app/)**
------
# Restaurant Tab System

This project is a comprehensive web application designed to help restaurants manage their tables, customers, and orders efficiently. It provides a user-friendly interface for seating arrangements, order taking (both individual and shared), menu management, and bill splitting, with data persistence across browser sessions.

## 🎯 Aim of the Project

The primary goal of this project is to streamline the operations of a restaurant by providing a digital solution for:
*   **Table Management:** Overseeing table status, capacity, and customer occupancy.
*   **Customer Tracking:** Identifying and managing customers at each table, including their type (man, woman, child) and assigned seats.
*   **Flexible Ordering:** Handling individual customer orders and shared "pool" orders for the entire table, with support for different measurement types (e.g., by amount or by portions).
*   **Menu Management:** Allowing restaurant staff to easily add, edit, and delete menu items, including creating combo meals.
*   **Visual Seating:** Providing a clear visual representation of customers at each table and their assigned seats.
*   **Bill Splitting:** Offering a robust system to assign payments for individual and shared orders, and calculate a breakdown for each payer.
*   **Data Persistence:** Ensuring that all restaurant configurations, customer data, and menu items are saved locally in the browser, so data is not lost on accidental reloads.

## ✨ Features

*   **Dynamic Table Setup:** Configure the number of tables and their default/individual capacities.
*   **Customer Seating:** Add different types of customers (man, woman, child) to specific numbered seats at a table.
*   **Individual & Pool Orders:** Customers can place individual orders, or items can be added to a shared "pool" for the entire table.
*   **Quantity Adjustment:** Easily adjust quantities for ordered items, supporting both whole numbers (for 'amount' items) and decimals (for 'portions' items).
*   **Comprehensive Menu Management:**
    *   Add new menu items with name, price, image, category, and measurement type.
    *   Create combo meals from existing menu items, with automatic measurement type inheritance.
    *   Edit and delete menu items.
*   **Real-time Order Updates:** Customer order lists and table totals update instantly.
*   **Advanced Bill Splitting:** Assign individual customers to pay for specific people or split pool orders among multiple payers.
*   **Local Data Persistence:** All application data (tables, customers, orders, menu) is saved to `localStorage` and reloaded on subsequent visits.
*   **Responsive Design:** The application is designed to be usable across various screen sizes.

## 🚀 Tech Stack

This project is built using modern web technologies to ensure a fast, scalable, and maintainable application:

*   **Next.js (App Router):** A React framework for building full-stack web applications, leveraging Server Components for optimal performance.
*   **React:** A JavaScript library for building user interfaces.
*   **Tailwind CSS:** A utility-first CSS framework for rapidly building custom designs.
*   **shadcn/ui:** A collection of reusable components built with Radix UI and Tailwind CSS, providing a beautiful and accessible UI.
*   **Lucide React:** A library of open-source icons used throughout the application.
*   **Local Storage:** Used for client-side data persistence, allowing the application state to be saved and reloaded across browser sessions.

## ⚙️ Setup and Installation

To run this project locally, follow these steps:

1.  **Clone the repository:**
    \`\`\`bash
    git clone <repository-url>
    cd restaurant-tab-system
    \`\`\`
2.  **Install dependencies:**
    \`\`\`bash
    npm install
    yarn install
    pnpm install
    \`\`\`
3.  **Run the development server:**
    \`\`\`bash
    npm run dev
    yarn dev
4. 
    pnpm dev
    \`\`\`
    Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 💡 Usage

1.  **Initial Setup:** On first load (or after clearing browser cache), you'll be prompted to set up the number of tables and their default capacities. You can also customize individual table capacities.
2.  **Manage Menu:** Click "Manage Menu" to add new food items, drinks, or create combo meals.
3.  **Manage Table:** Click on any table card to open the "Manage Table" dialog.
    *   **Add Customers:** Select a customer type (man, woman, child) and a specific seat number to add a customer.
    *   **Place Orders:** Click the `+` button next to a customer to add individual orders, or use the "Add Pool Order" button for shared items.
    *   **Adjust Quantities:** Use the `+` and `-` buttons next to ordered items to adjust quantities.
    *   **Remove Orders/Customers:** Use the trash icon to remove individual orders or customers.
    *   **Clear Table:** Use the "Clear Table" button to reset a table.
4.  **View Bill:** Click the "Bill" button on an occupied table card to see the order summary and assign payments.
    *   Assign who pays for each customer's order.
    *   Split pool orders among multiple adults.
    *   View the final payment breakdown for each payer.

## 🔮 Future Enhancements

Based on the project's current state and common restaurant needs, here are some potential future enhancements:

*   **Order Modifications:** Implement options to add notes to orders (e.g., "no onions"), mark items as void, or apply discounts.
*   **Tip Calculation:** Integrate a tip calculation feature into the bill splitting component.
*   **Order Timing:** Add a system to track the time orders are placed, sent to the kitchen, and served.
*   **Customer Preferences:** Allow recording and viewing customer preferences or dietary restrictions for future visits.
*   **Receipt Printing:** Simulate or implement a receipt printing functionality for the final bill.
*   **Payment Methods:** Integrate different payment methods (e.g., cash, card, split payment options).
*   **Kitchen Display System (KDS):** Develop a separate interface for the kitchen to view incoming orders and manage their status.
