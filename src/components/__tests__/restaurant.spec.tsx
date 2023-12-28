import { render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import { Restaurant } from "../restaurant";

describe("<Restaurant />", () => {
  it("renders restaurant details with correct props", () => {
    const restaurantProps = {
      id: "1",
      name: "name",
      categoryName: "categoryName",
      coverImg: "lala",
    };

    render(
      <Router>
        <Restaurant {...restaurantProps} />
      </Router>
    );

    // Link 요소를 찾아서 href 속성 확인
    const linkElement = screen.getByRole("link", {
      name: `${restaurantProps.name} ${restaurantProps.categoryName}`,
    });
    expect(linkElement).toHaveAttribute(
      "href",
      `/restaurant/${restaurantProps.id}`
    );
  });
});
