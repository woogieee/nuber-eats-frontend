import { gql, useApolloClient, useMutation, useQuery } from "@apollo/client";
import {
  CreateRestaurantMutation,
  CreateRestaurantMutationVariables,
} from "../../__generated__/graphql";
import { Controller, useForm } from "react-hook-form";
import { Button } from "../../components/button";
import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { FormError } from "../../components/form-error";
import { MY_RESTAURANTS_QUERY } from "./my-restaurants";
import { useHistory } from "react-router-dom";
import { CATEGORY_FRAGMENT } from "../../fragments";

const CREATE_RESTAURANT_MUTATION = gql`
  mutation createRestaurant($input: CreateRestaurantInput!) {
    createRestaurant(input: $input) {
      error
      ok
      restaurantId
    }
  }
`;

const ALL_CATEGORIES_QUERY = gql`
  query allCategories {
    allCategories {
      ok
      error
      categories {
        ...CategoryParts
      }
    }
  }
  ${CATEGORY_FRAGMENT}
`;

interface IFormProps {
  name: string;
  address: string;
  categoryName: string;
  file: FileList;
}

export const AddRestaurant = () => {
  const client = useApolloClient();
  const history = useHistory();
  const [imageUrl, setImageUrl] = useState("");
  const onCompleted = (data: CreateRestaurantMutation) => {
    const {
      createRestaurant: { ok, restaurantId },
    } = data;
    if (ok) {
      const { name, categoryName, address } = getValues();
      setUploading(false);
      const queryResult = client.readQuery({ query: MY_RESTAURANTS_QUERY }); // cache에서 읽음, api로 보내지 않음
      console.log(queryResult);
      if (!queryResult) {
        return;
      }
      client.writeQuery({
        query: MY_RESTAURANTS_QUERY,
        data: {
          myRestaurants: {
            // 원래 있던 쿼리를 무조건 다시 넣어야됨.
            ...queryResult.myRestaurants,
            restaurants: [
              {
                address,
                category: {
                  name: categoryName,
                  __typename: "Category",
                },
                coverImg: imageUrl,
                id: restaurantId,
                isPromoted: false,
                name,
                __typename: "Restaurant",
              },
              ...queryResult.myRestaurants.restaurants,
            ],
          },
        },
      });
      history.push("/");
    }
  };
  const [createRestaurantMutation, { data }] = useMutation<
    CreateRestaurantMutation,
    CreateRestaurantMutationVariables
  >(CREATE_RESTAURANT_MUTATION, {
    onCompleted,
  });

  const { control, register, getValues, formState, handleSubmit } =
    useForm<IFormProps>({
      mode: "onChange",
    });
  // 버튼 상태
  const [uploading, setUploading] = useState(false);

  const onSubmit = async () => {
    try {
      setUploading(true);
      const { file, name, categoryName, address } = getValues();
      const actualFile = file[0];
      const formBody = new FormData();
      formBody.append("file", actualFile);

      let uploadUrl = "";
      if (process.env.NODE_ENV === "production") {
        // 배포 환경
        uploadUrl = "https://nuber-eats-backend.onrender.com/uploads/";
      } else {
        // 로컬 환경
        uploadUrl = "http://localhost:4000/uploads/";
      }

      const { url: coverImg } = await (
        await fetch(uploadUrl, {
          method: "POST",
          body: formBody,
        })
      ).json();
      setImageUrl(coverImg);
      createRestaurantMutation({
        variables: {
          input: {
            name,
            categoryName,
            address,
            coverImg,
          },
        },
      });
    } catch (e) {
      console.log(e);
    }
  };

  // 카테고리 가져오기
  const { data: categoriesData } = useQuery(ALL_CATEGORIES_QUERY);

  return (
    <div className="container flex flex-col items-center mt-52">
      <Helmet>
        <title>Add Restaurant | Nuber Eats</title>
      </Helmet>
      <h4 className="font-semibold text-2xl mb-3">Add Restaurant</h4>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid max-w-screen-sm gap-3 mt-5 w-full mb-5"
      >
        <input
          className="input"
          type="text"
          placeholder="Name"
          minLength={5}
          {...register("name", { required: "Name is required" })}
        />
        <input
          className="input"
          type="text"
          placeholder="Address"
          {...register("address", { required: "Address is required" })}
        />
        {/* Category dropdown */}
        <div>
          <label className="text-lg font-medium mb-1">Category</label>
          <Controller
            control={control}
            name="categoryName"
            render={({ field }) => (
              <select {...field} className="input">
                <option value="">Select category</option>
                {categoriesData?.allCategories.categories?.map(
                  (category: any) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  )
                )}
              </select>
            )}
          />
        </div>
        <div>
          <input
            type="file"
            accept="image/*"
            {...register("file", { required: true })}
          />
        </div>
        <Button
          loading={uploading}
          canClick={formState.isValid}
          actionText="Create Restaurant"
        />
        {data?.createRestaurant?.error && (
          <FormError errorMessage={data.createRestaurant.error} />
        )}
      </form>
    </div>
  );
};
