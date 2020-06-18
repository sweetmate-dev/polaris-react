import React, {useState, useCallback} from 'react';

import {TextField} from '../TextField';
import {Button} from '../Button';
import {Popover} from '../Popover';
import {ActionList} from '../ActionList';

import styles from './PhoneField.scss';

interface Country {
  /** The country flag */
  image: string;
  /** Country name */
  countryName: string;
  /** Country area code */
  countryCode: string;
  /** Possible area codes for a country. Used to distinguish between countries with same country codes */
  areaCodes?: number[];
  /** An error message specific to the country */
  errorMessage?: string;
  /** Phone number display format */
  formatter(phoneNumber: string): string | null;
}

export interface PhoneFieldProps {
  /** Placeholder text  */
  placeholder?: string;
  /** Textfield label  */
  labelName: string;
  /** Hides the label for accessibility */
  labelHidden?: boolean;
  /** Is textfield optional */
  optional?: boolean;
  /** Error message */
  errorMessage: string;
  /** Country list in dropdown */
  countries: Country[];
}

export function PhoneField({
  errorMessage,
  placeholder,
  labelName,
  labelHidden,
  optional,
  countries,
}: PhoneFieldProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState<
    string | null
  >(null);
  const [popoverActive, setPopoverActive] = useState(countries.length > 1);
  const [selectedCountry, setSelectedCountry] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Conduct research on which country appears first
  const [searchBarText, setSearchBarText] = useState('');
  const allCountries = countries.map(
    ({countryName, image, countryCode}, index) => ({
      content: `${image}  ${countryName} (${countryCode})`,
      onAction: () => handleSelected(index),
    }),
  );

  const [countryOptions, setCountryOptions] = useState(allCountries);

  /** Callback function for handling when the popover is clicked */
  const togglePopoverActive = useCallback(() => {
    setPopoverActive((popoverActive) => !popoverActive);
    setSearchBarText('');
    setCountryOptions(allCountries);
  }, [allCountries]);

  const retrieveCountryIndex = useCallback(
    (countryName: string) => {
      const foundIndex = countries.findIndex(
        (element) => element.countryName === countryName,
      );
      return foundIndex;
    },
    [countries],
  );
  /** Callback function for handling the selected country */
  const handleSelected = useCallback(
    (index) => {
      setSelectedCountry(index);
      togglePopoverActive();
    },
    [togglePopoverActive],
  );

  const retrieveCountries = useCallback(
    (search: string) => {
      const results = countries
        .filter((countryObj) =>
          countryObj.countryName.toLowerCase().startsWith(search.toLowerCase()),
        )
        .map(({countryName, image, countryCode}) => ({
          content: `${image} ${countryName} (${countryCode})`,
          onAction: () => {
            handleSelected(retrieveCountryIndex(countryName));
          },
        }));

      return results;
    },
    [countries, handleSelected, retrieveCountryIndex],
  );

  /** Callback function for handling when the text in search bar changes */
  const handleSearchBar = useCallback(
    (country) => {
      setSearchBarText(country);
      setCountryOptions(retrieveCountries(country));
    },
    [retrieveCountries],
  );

  const buttonContent = `${countries[selectedCountry].countryName} (${countries[selectedCountry].countryCode})`;

  /** Handles the button that clicks for the popover */
  const activator =
    countries.length > 1 ? (
      <Button onClick={togglePopoverActive} disclosure>
        {buttonContent}
      </Button>
    ) : (
      <Button>{countries[selectedCountry].countryName}</Button>
    );

  /** Callback function for handling when the text in the phone number changes */
  const handleFormat = (phoneNumber: string) =>
    setFormattedPhoneNumber(countries[selectedCountry].formatter(phoneNumber));

  return (
    <React.Fragment>
      <TextField
        label={optional ? `${labelName} (optional)` : labelName}
        type="tel"
        placeholder={placeholder}
        value={formattedPhoneNumber || phoneNumber}
        onChange={setPhoneNumber}
        onBlur={() => {
          handleFormat(phoneNumber);
          setError(formattedPhoneNumber ? null : errorMessage);
        }}
        labelHidden={labelHidden}
        connectedLeft={
          <Popover
            active={popoverActive}
            activator={activator}
            onClose={togglePopoverActive}
            preferredAlignment="left"
          >
            <div className={styles.Searchbar}>
              <TextField
                label="Store name"
                value={searchBarText}
                labelHidden
                placeholder="Search for a country"
                onChange={handleSearchBar}
              />
            </div>

            <ActionList items={countryOptions} />
          </Popover>
        }
      />
      {error}
    </React.Fragment>
  );
}
