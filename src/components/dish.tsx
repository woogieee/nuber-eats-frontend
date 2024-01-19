import { DishOption } from "../__generated__/graphql";
import { useMe } from "../hooks/useMe";
import { UserRole } from "../__generated__/graphql";

interface IDishProps {
  id?: number;
  description: string;
  name: string;
  price: number;
  isCustomer?: boolean;
  orderStarted?: boolean;
  isSelected?: boolean;
  options?: DishOption[] | null;
  addItemToOrder?: (dishId: number) => void;
  removeFromOrder?: (dishId: number) => void;
  children?: React.ReactNode;
  photo?: string;
  dishDeletebtnClick?: (dishId: number, name: string) => void;
}

export const Dish: React.FC<IDishProps> = ({
  id = 0,
  description,
  name,
  price,
  isCustomer = false,
  orderStarted = false,
  isSelected,
  options,
  addItemToOrder,
  removeFromOrder,
  children: dishOptions,
  photo,
  dishDeletebtnClick,
}) => {
  const onClick = () => {
    if (orderStarted) {
      if (!isSelected && addItemToOrder) {
        return addItemToOrder(id);
      }
      if (isSelected && removeFromOrder) {
        return removeFromOrder(id);
      }
    }
  };
  console.log(photo);

  const { data } = useMe();

  return (
    <div
      className={`px-8 py-4 border cursor-pointer transition-all ${
        isSelected ? "border-gray-800" : "hover:border-gray-800"
      }`}
    >
      <div className="mb-5">
        <div
          style={{ backgroundImage: `url(${photo})` }}
          className=" bg-cover bg-center mb-3 py-28"
        ></div>
        <h3 className="text-lg font-medium flex items-center">
          {name}{" "}
          {orderStarted && (
            <button
              className={`ml-3 py-1 px-3 focus:outline-none text-sm  text-white ${
                isSelected ? "bg-red-500" : " bg-lime-600"
              }`}
              onClick={onClick}
            >
              {isSelected ? "Remove" : "Add"}
            </button>
          )}
          {data?.me.role === UserRole.Owner && (
            <button
              onClick={() => dishDeletebtnClick?.(id, name)}
              className=" hover:bg-orange-400 ml-3 py-1 px-3 focus:outline-none text-sm text-white bg-red-500"
            >
              delete
            </button>
          )}
        </h3>
        <h4 className="font-medium">{description}</h4>
      </div>

      <span>${price}</span>
      {isCustomer && options && options?.length !== 0 && (
        <div>
          <h5 className="mt-8 mb-3 font-medium">Dish Options:</h5>
          <div className="grid gap-2 justify-start">{dishOptions}</div>
        </div>
      )}
    </div>
  );
};
