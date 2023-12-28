import { render, screen } from "@testing-library/react";
import { Button } from "../button";

describe("<Button />", () => {
  it("should render Ok with Props", () => {
    render(<Button canClick={true} loading={false} actionText={"test"} />);
    expect(screen.getByText("test")).toBeInTheDocument();
  });
  it("should display loading", () => {
    render(<Button canClick={false} loading={true} actionText={"test"} />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    // expect(container.firstChild).toHaveClass("pointer-events-none");
    const button = screen.getByRole("button");
    expect(button).toHaveClass("pointer-events-none");
  });
});
