import { cleanup, render, screen } from "@testing-library/react";
import Toggle from "src/components/input/toggle";
import { afterEach, describe, expect, test } from "vitest";

describe.concurrent("Checkbox component", () => {
  afterEach(() => {
    cleanup();
  });

  test("toggle from false", () => {
    let toggled = false;

    render(
      <Toggle
        toggled={toggled}
        onChange={() => {
          toggled = !toggled;
        }}
      />
    );

    const checkbox = screen.getByRole("switch");

    checkbox.click();

    expect(toggled).toBeTruthy();

    checkbox.click();

    expect(toggled).toBeFalsy();
  });

  test("toggle toggle from true", () => {
    let toggled = true;

    render(
      <Toggle
        toggled={toggled}
        onChange={() => {
          toggled = !toggled;
        }}
      />
    );

    const checkbox = screen.getByRole("switch");

    checkbox.click();

    expect(toggled).toBeFalsy();

    checkbox.click();

    expect(toggled).toBeTruthy();
  });
});

// TODO:
// test("checkbox", () => {
//   let checked = false;

//   render(
//     <Checkbox
//       checked={checked}
//       onClick={() => {
//         checked = true;
//       }}
//     />
//   );

//   expect(checked).toBeFalsy();
// });
