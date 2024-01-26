import { gql, useMutation } from "@apollo/client";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { useHistory, useParams } from "react-router-dom";
import { Button } from "../../components/button";
import { MY_RESTAURANT_QUERY } from "./my-restaurant";
import {
  CreateDishMutation,
  CreateDishMutationVariables,
  DishOptionInputType,
} from "../../__generated__/graphql";
import { useState } from "react";
import { FormError } from "../../components/form-error";

const CREATE_DISH_MUTATION = gql`
  mutation createDish($input: CreateDishInput!) {
    createDish(input: $input) {
      ok
      error
    }
  }
`;

interface IParams {
  restaurantId: string;
}

interface IForm {
  name: string;
  price: string;
  description: string;
  file: FileList;
  [key: string]: string | FileList;
}

export const AddDish = () => {
  const { restaurantId } = useParams<IParams>();
  const history = useHistory();

  const [createDishMutation, { data }] = useMutation<
    CreateDishMutation,
    CreateDishMutationVariables
  >(CREATE_DISH_MUTATION, {
    refetchQueries: [
      {
        query: MY_RESTAURANT_QUERY,
        variables: {
          input: {
            id: +restaurantId,
          },
        },
      },
    ],
  });
  const { register, handleSubmit, formState, getValues, setValue } =
    useForm<IForm>({
      // 특정 input 값이 변경될 때마다 실시간으로 form에서 validate 해줌
      mode: "onChange",
    });
  const [uploading, setUploading] = useState(false);

  const onSubmit = async () => {
    try {
      setUploading(true);
      const { file, name, price, description, ...rest } = getValues();
      /* 사진 업로드 시작 */
      const actualFile = file[0];
      const formBody = new FormData();
      formBody.append("file", actualFile);
      const { url: photo } = await (
        await fetch("http://localhost:4000/uploads/", {
          method: "POST",
          body: formBody,
        })
      ).json();
      /* 사진 업로드 종료 */
      const optionObjects = optionsNumber.map((theId) => ({
        name: rest[`${theId}-optionName`],
        extra: +rest[`${theId}-optionExtra`],
      }));
      createDishMutation({
        variables: {
          input: {
            name,
            price: +price,
            description,
            restaurantId: +restaurantId,
            options: optionObjects as DishOptionInputType[],
            photo,
          },
        },
      });
      history.goBack();
    } catch (error) {}
  };

  const [optionsNumber, setOptionsNumber] = useState<number[]>([]);
  // 옵션 추가 버튼
  const onAddOptionClick = () => {
    setOptionsNumber((current) => [Date.now(), ...current]);
  };
  // 옵션 삭제버튼
  const onDeleteClick = (idToDelete: number) => {
    // option input을 사라지게 함
    // filter 조건: id는 삭제하려는 id와 달라야 함.
    setOptionsNumber((current) => current.filter((id) => id !== idToDelete));
    setValue(`${idToDelete}-optionName`, "");
    setValue(`${idToDelete}-optionExtra`, "");
  };

  return (
    <div className="container flex flex-col items-center mt-52">
      <Helmet>
        <title>Add Dish | Nuber Eats</title>
      </Helmet>
      <h4 className="font-semibold text-2xl mb-3">Add Dish</h4>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid max-w-screen-sm gap-3 mt-5 w-full mb-5"
      >
        <input
          className="input"
          type="text"
          placeholder="Name"
          {...register("name", { required: "Name is required." })}
        />
        <input
          className="input"
          type="number"
          min={0}
          placeholder="Price"
          {...register("price", { required: "Price is required." })}
        />
        <input
          className="input"
          type="text"
          placeholder="Description"
          minLength={5}
          {...register("description", { required: "description is required." })}
        />
        <div>
          <input
            type="file"
            accept="image/*"
            {...register("file", { required: true })}
          />
        </div>
        <div className=" my-10">
          <h4 className=" font-medium mb-3 text-lg text-center">
            Dish Options
          </h4>
          <span
            onClick={onAddOptionClick}
            className="cursor-pointer text-white bg-gray-900 py-1 px-2 mt-5"
          >
            Add Dish Option
          </span>
          {optionsNumber.length !== 0 &&
            optionsNumber.map((id) => (
              <div key={id} className=" mt-5">
                <input
                  {...register(`${id}-optionName`)}
                  className="py-2 px-4 focus:outline-none mr-3 focus:border-gray-600 border-2"
                  type="text"
                  placeholder="Option Name"
                />
                <input
                  {...register(`${id}-optionExtra`)}
                  className="py-2 px-4 focus:outline-none focus:border-gray-600 border-2"
                  type="number"
                  min={0}
                  placeholder="Option Extra"
                />
                <span
                  className="cursor-pointer text-white bg-red-500 ml-3 py-3 px-4 mt-5"
                  onClick={() => onDeleteClick(id)}
                >
                  Delete Option
                </span>
              </div>
            ))}
        </div>
        <Button
          loading={uploading}
          canClick={formState.isValid}
          actionText="Create Dish"
        />
        {data?.createDish.error && (
          <FormError errorMessage={data.createDish.error} />
        )}
      </form>
    </div>
  );
};
